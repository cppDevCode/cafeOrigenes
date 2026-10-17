import 'dotenv/config';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { sequelize } from '../config/BaseDeDatos.js';
import { ProductoRouter } from '../routes/producto.route.js';

const app = express();
app.use(express.json());
app.use('/productos', new ProductoRouter().getRouter());

describe('Productos (integración)', () => {
    beforeAll(async () => {
        if (process.env.NODE_ENV !== 'test') throw new Error('Estos tests solo corren con NODE_ENV=test');

        // productos no tiene modelo de Sequelize, así que sync() no la crea: la creamos con SQL
        await sequelize.query(`
        CREATE TABLE IF NOT EXISTS productos (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL UNIQUE,
            tipo VARCHAR(20) NOT NULL
            CHECK (tipo IN ('CAFE_EXPRESO', 'CAFE_FILTRADO', 'PASTELERIA')),
            precio_base INTEGER NOT NULL CHECK (precio_base > 0),
            tamano VARCHAR(20)
            CHECK (tamano IN ('POCILLO', 'MEDIANO', 'TAZA_GRANDE')),
            gramos INTEGER CHECK (gramos > 0),
            variedad VARCHAR(20)
            CHECK (variedad IN ('BRASIL', 'COLOMBIA', 'ETIOPIA')),

            CONSTRAINT chk_cafe_o_pasteleria CHECK (
            (tipo = 'PASTELERIA'
                AND tamano IS NULL AND gramos IS NULL AND variedad IS NULL)
            OR
            (tipo IN ('CAFE_EXPRESO', 'CAFE_FILTRADO')
                AND tamano IS NOT NULL AND gramos IS NOT NULL AND variedad IS NOT NULL)
            )
        );
        `);
    });

    beforeEach(async () => {
        // Datos conocidos: id 1 = café expreso, id 2 = pastelería, id 3 = café filtrado
        await sequelize.query('TRUNCATE productos RESTART IDENTITY');
        await sequelize.query(`
        INSERT INTO productos (nombre, tipo, precio_base, tamano, gramos, variedad) VALUES
            ('Expreso Pocillo Brasil', 'CAFE_EXPRESO', 2500, 'POCILLO', 18, 'BRASIL'),
            ('Muffin de chocolate', 'PASTELERIA', 2500, NULL, NULL, NULL),
            ('Filtrado Mediano Colombia', 'CAFE_FILTRADO', 3200, 'MEDIANO', 15, 'COLOMBIA');
        `);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('GET /productos', () => {
        it('lista los productos con su precio calculado', async () => {
        const res = await request(app).get('/productos');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(3);
        expect(res.body[0]).toMatchObject({ id: 1, nombre: 'Expreso Pocillo Brasil', tipo: 'CAFE_EXPRESO', precio: 5020 });
        expect(res.body[1]).toMatchObject({ id: 2, nombre: 'Muffin de chocolate', tipo: 'PASTELERIA', precio: 2500 });
        expect(res.body[2]).toMatchObject({ id: 3, nombre: 'Filtrado Mediano Colombia', tipo: 'CAFE_FILTRADO', precio: 5900 });
        });

        it('devuelve una lista vacía si no hay productos', async () => {
        await sequelize.query('TRUNCATE productos RESTART IDENTITY');

        const res = await request(app).get('/productos');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
        });
    });

    describe('GET /productos/:id', () => {
        it('devuelve un café con sus datos y su precio calculado', async () => {
        const res = await request(app).get('/productos/1');

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            id: 1,
            nombre: 'Expreso Pocillo Brasil',
            tipo: 'CAFE_EXPRESO',
            precioBase: 2500,
            tamano: 'POCILLO',
            gramos: 18,
            variedad: 'BRASIL',
            precio: 5020,
        });
        });

        it('devuelve la pastelería sin tamaño, gramos ni variedad', async () => {
        const res = await request(app).get('/productos/2');

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ id: 2, tipo: 'PASTELERIA', precio: 2500 });
        expect(res.body).not.toHaveProperty('tamano');
        expect(res.body).not.toHaveProperty('gramos');
        expect(res.body).not.toHaveProperty('variedad');
        });

        it('responde 404 si el producto no existe', async () => {
        const res = await request(app).get('/productos/999');

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('error');
        });

        it('responde 400 si el id no es un número', async () => {
        const res = await request(app).get('/productos/abc');

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
        });
    });
});