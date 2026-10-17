import { test, expect } from '@playwright/test';
import type { FacturacionResponseDTO, MasVendidoResponseDTO } from '../src/interfaces/reportes.interface.js';

test.describe('Módulo de Reportes E2E', () => {
  test('GET /api/reportes/facturacion - debe responder con total numérico de facturación entregada', async ({ request }) => {
    const response = await request.get('/api/reportes/facturacion');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const data: FacturacionResponseDTO = await response.json();
    expect(typeof data.total).toBe('number');
    // Con los 150 pedidos sembrados, la facturación total supera el millón
    expect(data.total).toBeGreaterThan(0);
  });

  test('GET /api/reportes/mas-vendido - debe identificar el producto más vendido con cantidad', async ({ request }) => {
    const response = await request.get('/api/reportes/mas-vendido');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const data: MasVendidoResponseDTO = await response.json();
    expect(typeof data.productoId).toBe('number');
    expect(data.productoId).toBeGreaterThan(0);
    expect(typeof data.nombre).toBe('string');
    expect(data.nombre.length).toBeGreaterThan(0);
    expect(typeof data.cantidadVendida).toBe('number');
    expect(data.cantidadVendida).toBeGreaterThan(0);
  });
});

