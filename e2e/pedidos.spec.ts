import { test, expect } from '@playwright/test';
import type { PedidoResponseDTO } from '../src/interfaces/pedido.interface.js';

test.describe('Módulo de Pedidos E2E', () => {
  test.describe('GET /api/pedidos', () => {
    test('debe listar los pedidos existentes con items y totales numéricos', async ({ request }) => {
      const response = await request.get('/api/pedidos');

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const pedidos: PedidoResponseDTO[] = await response.json();
      expect(Array.isArray(pedidos)).toBe(true);
      expect(pedidos.length).toBeGreaterThan(0);

      const primerPedido = pedidos[0];
      expect(primerPedido).toBeDefined();
      if (primerPedido) {
        expect(typeof primerPedido.id).toBe('number');
        expect(typeof primerPedido.total).toBe('number');
        expect(['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO']).toContain(primerPedido.estado);
        expect(Array.isArray(primerPedido.items)).toBe(true);
        expect(primerPedido.items.length).toBeGreaterThan(0);

        const item = primerPedido.items[0];
        expect(item).toBeDefined();
        if (item) {
          expect(typeof item.productoId).toBe('number');
          expect(typeof item.cantidad).toBe('number');
          expect(typeof item.precioUnitario).toBe('number');
          expect(item.cantidad).toBeGreaterThan(0);
          expect(item.precioUnitario).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('POST /api/pedidos', () => {
    test('debe crear un pedido con un único ítem y retornar estado 201 con total calculado', async ({ request }) => {
      // Producto 6: Medialuna de manteca (precio = 1200)
      const payload = {
        items: [
          { productoId: 6, cantidad: 2 },
        ],
      };

      const response = await request.post('/api/pedidos', { data: payload });

      expect(response.status()).toBe(201);
      const pedidoCreado: PedidoResponseDTO = await response.json();

      expect(pedidoCreado.id).toBeGreaterThan(0);
      expect(pedidoCreado.estado).toBe('PENDIENTE');
      expect(pedidoCreado.total).toBe(2400); // 2 * 1200
      expect(pedidoCreado.items).toHaveLength(1);
      expect(pedidoCreado.items[0]).toMatchObject({
        productoId: 6,
        cantidad: 2,
        precioUnitario: 1200,
      });
    });

    test('debe crear un pedido con múltiples ítems (café + pastelería) calculando el total correctamente', async ({ request }) => {
      // Producto 1: Café Expreso Pocillo (Colombia) -> precio = 4300
      // Producto 6: Medialuna de manteca -> precio = 1200
      // Total esperado: (1 * 4300) + (3 * 1200) = 4300 + 3600 = 7900
      const payload = {
        items: [
          { productoId: 1, cantidad: 1 },
          { productoId: 6, cantidad: 3 },
        ],
      };

      const response = await request.post('/api/pedidos', { data: payload });

      expect(response.status()).toBe(201);
      const pedidoCreado: PedidoResponseDTO = await response.json();

      expect(pedidoCreado.estado).toBe('PENDIENTE');
      expect(pedidoCreado.total).toBe(7900);
      expect(pedidoCreado.items).toHaveLength(2);

      const itemCafe = pedidoCreado.items.find((i) => i.productoId === 1);
      const itemPasteleria = pedidoCreado.items.find((i) => i.productoId === 6);

      expect(itemCafe).toMatchObject({
        productoId: 1,
        cantidad: 1,
        precioUnitario: 4300,
      });
      expect(itemPasteleria).toMatchObject({
        productoId: 6,
        cantidad: 3,
        precioUnitario: 1200,
      });
    });

    test('debe responder 404 si un producto del pedido no existe', async ({ request }) => {
      const payload = {
        items: [
          { productoId: 999999, cantidad: 1 },
        ],
      };

      const response = await request.post('/api/pedidos', { data: payload });

      expect(response.status()).toBe(404);
      const body = await response.json();
      expect(body).toEqual({ error: 'El producto 999999 no fue encontrado' });
    });
  });

  test.describe('GET /api/pedidos/:id', () => {
    test('debe retornar el detalle exacto de un pedido existente', async ({ request }) => {
      // 1. Crear un pedido primero para asegurar su existencia
      const nuevo = await request.post('/api/pedidos', {
        data: {
          items: [{ productoId: 6, cantidad: 1 }],
        },
      });
      const creado: PedidoResponseDTO = await nuevo.json();

      // 2. Consultar el pedido por ID
      const response = await request.get(`/api/pedidos/${creado.id}`);

      expect(response.status()).toBe(200);
      const pedido: PedidoResponseDTO = await response.json();

      expect(pedido.id).toBe(creado.id);
      expect(pedido.total).toBe(1200);
      expect(pedido.estado).toBe('PENDIENTE');
      expect(pedido.items).toHaveLength(1);
      expect(pedido.items[0]?.productoId).toBe(6);
    });

    test('debe responder 404 si el id de pedido no existe', async ({ request }) => {
      const response = await request.get('/api/pedidos/9999999');

      expect(response.status()).toBe(404);
      const body = await response.json();
      expect(body).toEqual({ error: 'Pedido no encontrado' });
    });

    test('debe responder 404 si el id no es un número entero positivo', async ({ request }) => {
      const response = await request.get('/api/pedidos/abc');

      expect(response.status()).toBe(404);
      const body = await response.json();
      expect(body).toEqual({ error: 'Pedido no encontrado' });
    });
  });
});
