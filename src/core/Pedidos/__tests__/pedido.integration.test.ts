import 'dotenv/config'; 
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { sequelize } from '../../../config/database.js';
import { initPedidoModels, PedidoItemModel, PedidoModel } from '../Pedido.model.js';
import { PedidoService } from '../Pedido.service.js';
import { createPedidoRouter } from '../Pedido.routes.js';
import type { IProducto, IProductoRepository } from '../../../interfaces/producto.interface.js';


const productoStub = (id: number, precio: number): IProducto => ({
  id,
  nombre: `Producto ${id}`,
  tipo: 'PASTELERIA',
  precioBase: 1,
  calcularPrecio: () => precio,
});
const catalogo = new Map<number, IProducto>([
  [1, productoStub(1, 5020)],
  [2, productoStub(2, 2500)],
]);
const productos: IProductoRepository = {
  findById: async (id) => catalogo.get(id) ?? null,
  findAll: async () => [...catalogo.values()],
};

const app = express();
app.use(express.json());
app.use('/pedidos', createPedidoRouter(new PedidoService(productos, sequelize)));

describe('Pedidos (integración)', () => {
  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test') throw new Error('Estos tests solo corren con NODE_ENV=test');
    initPedidoModels(sequelize);
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await PedidoItemModel.destroy({ where: {} });
    await PedidoModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /pedidos', () => {
    it('crea un pedido y devuelve su total calculado', async () => {
      const res = await request(app)
        .post('/pedidos')
        .send({
          items: [
            { productoId: 1, cantidad: 2 },
            { productoId: 2, cantidad: 1 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toEqual(expect.any(Number));
      expect(res.body.estado).toBe('PENDIENTE');
      expect(res.body.total).toBe(12540);
      expect(res.body.items).toHaveLength(2);
      expect(res.body.items[0]).toMatchObject({ productoId: 1, cantidad: 2, precioUnitario: 5020 });
    });

    it('responde 404 si un producto no existe', async () => {
      const res = await request(app)
        .post('/pedidos')
        .send({ items: [{ productoId: 99, cantidad: 1 }] });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /pedidos', () => {
    it('devuelve una lista vacía si no hay pedidos', async () => {
      const res = await request(app).get('/pedidos');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('lista los pedidos creados con sus items', async () => {
      await request(app).post('/pedidos').send({ items: [{ productoId: 1, cantidad: 1 }] });
      await request(app).post('/pedidos').send({ items: [{ productoId: 2, cantidad: 3 }] });

      const res = await request(app).get('/pedidos');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].total).toBe(5020);
      expect(res.body[1].total).toBe(7500);
      expect(res.body[1].items[0]).toMatchObject({ productoId: 2, cantidad: 3 });
    });
  });
});