import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Sequelize } from 'sequelize';
import { PedidoItemModel, PedidoModel } from '../model/Pedido.model.js';
import { PedidoService } from '../service/Pedido.service.js';
import { createPedidoRouter } from '../routes/Pedido.routes.js';
import type { IProducto, IProductoRepository } from '../interfaces/producto.interface.js';

// Stub de productos
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

// Mock de Sequelize
const transaccionFalsa = { fakeTransaction: true };
const mockSequelize = {
  transaction: vi.fn(async <T>(callback: (t: typeof transaccionFalsa) => Promise<T>): Promise<T> =>
    callback(transaccionFalsa),
  ),
};

// Mock de los métodos estáticos de los modelos
vi.mock('../model/Pedido.model.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../model/Pedido.model.js')>();
  return {...actual,
    PedidoModel: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findAll: vi.fn().mockResolvedValue([]),
      findByPk: vi.fn().mockResolvedValue(null),
    },

    PedidoItemModel: {
      bulkCreate: vi.fn().mockResolvedValue([]),
    },
  };
});


// App Express
const app = express();
app.use(express.json());
app.use(
  '/pedidos',
  createPedidoRouter(
    new PedidoService(
      productos,
      mockSequelize as unknown as Sequelize,
    ),
  ),
);

const filaItem = (id: number, pedidoId: number, productoId: number, cantidad: number, precio: string) => ({
  id, pedidoId, productoId, cantidad, precioUnitario: precio,
});
type Fila = Awaited<ReturnType<typeof PedidoModel.findByPk>>;

// Tests de integración con mocks
describe('Pedidos (integración con mocks)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // POST /pedidos
  describe('POST /pedidos', () => {
    it('crea un pedido y devuelve su total calculado', async () => {
      vi.mocked(PedidoModel.findByPk).mockResolvedValueOnce({
        id: 1,
        estado: 'PENDIENTE',
        total: '12540.00',
        items: [filaItem(1, 1, 1, 2, '5020.00'), filaItem(2, 1, 2, 1, '2500.00')],
      } as unknown as Fila);
 
      const res = await request(app)
        .post('/pedidos')
        .send({ items: [{ productoId: 1, cantidad: 2 }, { productoId: 2, cantidad: 1 }] });
 
      expect(res.status).toBe(201);
      expect(res.body.total).toBe(12540); 
      expect(res.body.items).toHaveLength(2);
 
      
      expect(PedidoModel.create).toHaveBeenCalledWith(
        { estado: 'PENDIENTE', total: 12540 },
        { transaction: transaccionFalsa },
      );
      expect(PedidoItemModel.bulkCreate).toHaveBeenCalledWith(
        [
          { pedidoId: 1, productoId: 1, cantidad: 2, precioUnitario: 5020 },
          { pedidoId: 1, productoId: 2, cantidad: 1, precioUnitario: 2500 },
        ],
        { transaction: transaccionFalsa },
      );
    });
 
    it('responde 404 si un producto no existe y no guarda nada', async () => {
      const res = await request(app)
        .post('/pedidos')
        .send({ items: [{ productoId: 99, cantidad: 1 }] });
 
      expect(res.status).toBe(404);
      expect(PedidoModel.create).not.toHaveBeenCalled();
      expect(PedidoItemModel.bulkCreate).not.toHaveBeenCalled();
    });
  });
 //GET /pedidos
  describe('GET /pedidos', () => {
    it('devuelve una lista vacía si no hay pedidos', async () => {
      const res = await request(app).get('/pedidos');
 
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
 
    it('lista los pedidos con sus items y totales numéricos', async () => {
      vi.mocked(PedidoModel.findAll).mockResolvedValueOnce([
        { id: 1, estado: 'PENDIENTE', total: '5020.00', items: [filaItem(1, 1, 1, 1, '5020.00')] },
        { id: 2, estado: 'PENDIENTE', total: '7500.00', items: [filaItem(2, 2, 2, 3, '2500.00')] },
      ] as unknown as Awaited<ReturnType<typeof PedidoModel.findAll>>);
 
      const res = await request(app).get('/pedidos');
 
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].total).toBe(5020);
      expect(res.body[1].total).toBe(7500);
      expect(res.body[1].items[0]).toMatchObject({ productoId: 2, cantidad: 3, precioUnitario: 2500 });
    });
  });
});