import { test, expect } from '@playwright/test';

test.describe('Seguridad y Encabezados HTTP E2E', () => {
  test('debe incluir encabezados de seguridad de Helmet en las respuestas', async ({ request }) => {
    const response = await request.get('/health');
    const headers = response.headers();

    // Helmet security headers
    expect(headers).toHaveProperty('x-content-type-options', 'nosniff');
    expect(headers).toHaveProperty('x-dns-prefetch-control', 'off');
    expect(headers).toHaveProperty('x-download-options', 'noopen');
    expect(headers).toHaveProperty('x-frame-options', 'SAMEORIGIN');
    expect(headers).toHaveProperty('x-permitted-cross-domain-policies', 'none');
  });

  test('debe responder con encabezados CORS para peticiones permitidas', async ({ request }) => {
    const origin = process.env.CORS_ORIGIN || 'http://localhost:3002';
    const response = await request.fetch('/api/productos', {
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
      },
    });

    // CORS preflight response
    expect([200, 204]).toContain(response.status());
    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBe(origin);
    expect(headers['access-control-allow-credentials']).toBe('true');
  });
});

