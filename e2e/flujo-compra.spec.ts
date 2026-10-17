import { test, expect } from '@playwright/test';
import type { ProductoResponseDTO } from '../src/interfaces/producto.interface.js';
import type { PedidoResponseDTO } from '../src/interfaces/pedido.interface.js';

test.describe('Flujo de Negocio Completo E2E (Compra y Persistencia)', () => {
  test('un cliente consulta catálogo, arma un pedido mixto, confirma la orden y valida su persistencia', async ({ request }) => {
    // 1. Paso 1: Verificar disponibilidad del servicio
    const healthRes = await request.get('/health');
    expect(healthRes.status()).toBe(200);

    // 2. Paso 2: Obtener catálogo de productos
    const productosRes = await request.get('/api/productos');
    expect(productosRes.status()).toBe(200);
    const catalogo: ProductoResponseDTO[] = await productosRes.json();
    expect(catalogo.length).toBeGreaterThan(0);

    // Buscar un café y una pastelería
    const cafe = catalogo.find((p) => p.tipo === 'CAFE_EXPRESO' || p.tipo === 'CAFE_FILTRADO');
    const pasteleria = catalogo.find((p) => p.tipo === 'PASTELERIA');

    expect(cafe).toBeDefined();
    expect(pasteleria).toBeDefined();

    if (!cafe || !pasteleria) {
      throw new Error('No se encontraron productos de café y pastelería en el catálogo');
    }

    const cantidadCafe = 2;
    const cantidadPasteleria = 1;
    const totalEsperado = (cafe.precio * cantidadCafe) + (pasteleria.precio * cantidadPasteleria);

    // 3. Paso 3: Realizar el pedido (POST /api/pedidos)
    const pedidoPayload = {
      items: [
        { productoId: cafe.id, cantidad: cantidadCafe },
        { productoId: pasteleria.id, cantidad: cantidadPasteleria },
      ],
    };

    const ordenRes = await request.post('/api/pedidos', { data: pedidoPayload });
    expect(ordenRes.status()).toBe(201);
    const pedidoCreado: PedidoResponseDTO = await ordenRes.json();

    expect(pedidoCreado.id).toBeGreaterThan(0);
    expect(pedidoCreado.estado).toBe('PENDIENTE');
    expect(pedidoCreado.total).toBe(totalEsperado);
    expect(pedidoCreado.items).toHaveLength(2);

    // 4. Paso 4: Validar persistencia consultando directamente el pedido por ID (GET /api/pedidos/:id)
    const detalleRes = await request.get(`/api/pedidos/${pedidoCreado.id}`);
    expect(detalleRes.status()).toBe(200);
    const pedidoDetalle: PedidoResponseDTO = await detalleRes.json();

    expect(pedidoDetalle.id).toBe(pedidoCreado.id);
    expect(pedidoDetalle.total).toBe(totalEsperado);
    expect(pedidoDetalle.estado).toBe('PENDIENTE');
    expect(pedidoDetalle.items).toHaveLength(2);

    const itemDetalleCafe = pedidoDetalle.items.find((i) => i.productoId === cafe.id);
    const itemDetallePasteleria = pedidoDetalle.items.find((i) => i.productoId === pasteleria.id);

    expect(itemDetalleCafe).toBeDefined();
    expect(itemDetalleCafe?.cantidad).toBe(cantidadCafe);
    expect(itemDetalleCafe?.precioUnitario).toBe(cafe.precio);

    expect(itemDetallePasteleria).toBeDefined();
    expect(itemDetallePasteleria?.cantidad).toBe(cantidadPasteleria);
    expect(itemDetallePasteleria?.precioUnitario).toBe(pasteleria.precio);

    // 5. Paso 5: Validar que el pedido aparece en el listado histórico (GET /api/pedidos)
    const listadoRes = await request.get('/api/pedidos');
    expect(listadoRes.status()).toBe(200);
    const todosPedidos: PedidoResponseDTO[] = await listadoRes.json();

    const pedidoEncontrado = todosPedidos.find((p) => p.id === pedidoCreado.id);
    expect(pedidoEncontrado).toBeDefined();
    expect(pedidoEncontrado?.total).toBe(totalEsperado);
  });
});

