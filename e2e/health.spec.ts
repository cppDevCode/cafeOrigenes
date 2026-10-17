import { test, expect } from '@playwright/test';

test.describe('Health Checks & Enrutamiento E2E', () => {
  test('GET /health - debe responder con estado 200, status OK, uptime y timestamp', async ({ request }) => {
    const response = await request.get('/health');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    expect(body).toHaveProperty('status', 'OK');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('uptime');
    expect(typeof body.uptime).toBe('number');
    expect(body.uptime).toBeGreaterThan(0);
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });

  test('GET /api/health - debe responder con estado 200 y mensaje del sistema', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    expect(body).toMatchObject({
      status: 'OK',
      message: 'API funcionando correctamente',
    });
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('environment');
  });

  test('GET /ruta-inexistente - debe responder 404 para endpoints raíz no definidos', async ({ request }) => {
    const response = await request.get('/ruta-inexistente');

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: 'Route not found' });
  });

  test('GET /api/ruta-inexistente - debe responder 404 para rutas de API no definidas', async ({ request }) => {
    const response = await request.get('/api/ruta-inexistente');

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: 'Route not found' });
  });
});

