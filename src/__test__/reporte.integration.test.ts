import 'dotenv/config';
import { beforeEach, describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { ReporteService } from '../service/reporte.service.js';
import { ReporteRouter } from '../routes/reporte.route.js';
import type { IReporteRepository, MasVendidoResponseDTO } from '../interfaces/reportes.interface.js';

interface PedidoStub {
  id: number;
  estado: string;
  total: number;
}

interface ProductoStub {
  id: number;
  nombre: string;
}

interface ItemPedidoStub {
  id: number;
  pedidoId: number;
  productoId: number;
  cantidad: number;
}

const pedidos = new Map<number, PedidoStub>();
const productos = new Map<number, ProductoStub>();
const itemsPedido = new Map<number, ItemPedidoStub>();

const reporteRepository: IReporteRepository = {
  obtenerFacturacionTotal: async (): Promise<number> => {
    let total = 0;
    for (const pedido of pedidos.values()) {
      if (pedido.estado === 'ENTREGADO') {
        total += pedido.total;
      }
    }
    return total;
  },

  obtenerMasVendido: async (): Promise<MasVendidoResponseDTO | null> => {
    const cantidadesVendidas = new Map<number, number>();

    for (const item of itemsPedido.values()) {
      const pedido = pedidos.get(item.pedidoId);
      if (pedido?.estado === 'ENTREGADO') {
        const actual = cantidadesVendidas.get(item.productoId) ?? 0;
        cantidadesVendidas.set(item.productoId, actual + item.cantidad);
      }
    }

    if (cantidadesVendidas.size === 0) {
      return null;
    }

    let masVendidoId: number | null = null;
    let maxCantidad = 0;

    for (const [productoId, cantidad] of cantidadesVendidas.entries()) {
      if (
        cantidad > maxCantidad ||
        (cantidad === maxCantidad && (masVendidoId === null || productoId < masVendidoId))
      ) {
        maxCantidad = cantidad;
        masVendidoId = productoId;
      }
    }

    if (masVendidoId === null || maxCantidad === 0) {
      return null;
    }

    const producto = productos.get(masVendidoId);
    return {
      productoId: masVendidoId,
      nombre: producto?.nombre ?? '',
      cantidadVendida: maxCantidad,
    };
  },
};

const app = express();
app.use(express.json());
app.use('/reportes', new ReporteRouter(new ReporteService(reporteRepository)).getRouter());

describe('Reportes (integración)', () => {
  beforeEach(() => {
    pedidos.clear();
    productos.clear();
    itemsPedido.clear();
  });

  describe('GET /reportes/facturacion', () => {
    it('devuelve 0 cuando no hay pedidos entregados', async () => {
      const response = await request(app).get('/reportes/facturacion');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ total: 0 });
    });

    it('suma solo el total de los pedidos entregados', async () => {
      pedidos.set(1, { id: 1, estado: 'ENTREGADO', total: 16150 });
      pedidos.set(2, { id: 2, estado: 'ENTREGADO', total: 3000 });
      pedidos.set(3, { id: 3, estado: 'PENDIENTE', total: 5000 });

      const response = await request(app).get('/reportes/facturacion');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ total: 19150 });
    });
  });

  describe('GET /reportes/mas-vendido', () => {
    it('devuelve 404 cuando no hay productos vendidos', async () => {
      const response = await request(app).get('/reportes/mas-vendido');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Todavía no hay ventas' });
    });

    it('devuelve el producto con más unidades en pedidos entregados', async () => {
      productos.set(1, { id: 1, nombre: 'Café expreso' });
      productos.set(2, { id: 2, nombre: 'Café filtrado' });

      pedidos.set(1, { id: 1, estado: 'ENTREGADO', total: 10000 });
      pedidos.set(2, { id: 2, estado: 'ENTREGADO', total: 5000 });
      pedidos.set(3, { id: 3, estado: 'PENDIENTE', total: 9000 });

      itemsPedido.set(1, { id: 1, pedidoId: 1, productoId: 1, cantidad: 2 });
      itemsPedido.set(2, { id: 2, pedidoId: 2, productoId: 1, cantidad: 2 });
      itemsPedido.set(3, { id: 3, pedidoId: 1, productoId: 2, cantidad: 3 });
      itemsPedido.set(4, { id: 4, pedidoId: 3, productoId: 2, cantidad: 20 });

      const response = await request(app).get('/reportes/mas-vendido');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        productoId: 1,
        nombre: 'Café expreso',
        cantidadVendida: 4,
      });
    });
  });
});