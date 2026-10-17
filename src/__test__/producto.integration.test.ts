import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { IProducto, IProductoRepository } from '../interfaces/producto.interface.js';
import { CafeExpreso } from '../model/cafeExpreso.model.js';
import { CafeFiltrado } from '../model/cafeFiltrado.model.js';
import { Pasteleria } from '../model/pasteleria.model.js';
import { ProductoService } from '../service/producto.service.js';
import { ProductoController } from '../controller/producto.controller.js';


    const catalogo = new Map<number, IProducto>([
    [1, new CafeExpreso(1, 'Expreso Pocillo Brasil', 2500, 'POCILLO', 18, 'BRASIL')],
    [2, new Pasteleria(2, 'Muffin de chocolate', 2500)],
    [3, new CafeFiltrado(3, 'Filtrado Mediano Colombia', 3200, 'MEDIANO', 15, 'COLOMBIA')],
    ]);

    describe('Productos', () => {
    let repo: Mocked<IProductoRepository>;
    let app: express.Express;

    beforeEach(() => {
        repo = {
        findById: vi.fn(async (id: number) => catalogo.get(id) ?? null),
        findAll: vi.fn(async () => [...catalogo.values()]),
        };

        // Mismo cableado que ProductoRouter, pero con el repository falso
        const controller = new ProductoController(new ProductoService(repo));
        const router = express.Router();
        router.get('/', controller.listar);
        router.get('/:id', controller.obtenerPorId);

        app = express();
        app.use(express.json());
        app.use('/productos', router);
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
        repo.findAll.mockResolvedValueOnce([]);

        const res = await request(app).get('/productos');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
        });

        it('responde 500 si el repository falla', async () => {
        repo.findAll.mockRejectedValueOnce(new Error('falla de base de datos'));

        const res = await request(app).get('/productos');

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
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
        expect(repo.findById).toHaveBeenCalledWith(1);
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

        it('responde 400 si el id no es un número y no consulta el repository', async () => {
        const res = await request(app).get('/productos/abc');

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
        expect(repo.findById).not.toHaveBeenCalled();
        });

        it('responde 500 si el repository falla', async () => {
        repo.findById.mockRejectedValueOnce(new Error('falla de base de datos'));

        const res = await request(app).get('/productos/1');

        expect(res.status).toBe(500);
        });
    });
    });