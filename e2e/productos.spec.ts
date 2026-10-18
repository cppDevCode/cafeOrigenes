import { test, expect } from '@playwright/test';
import type { ProductoResponseDTO } from '../src/interfaces/producto.interface.js';

test.describe('Módulo de Productos E2E', () => {
  test.describe('GET /api/productos', () => {
    test('debe listar todos los productos con sus precios calculados y estructura válida', async ({ request }) => {
      const response = await request.get('/api/productos');

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const productos: ProductoResponseDTO[] = await response.json();
      expect(Array.isArray(productos)).toBe(true);
      expect(productos.length).toBeGreaterThanOrEqual(10);

      // Validar estructura y reglas de dominio para cada tipo de producto
      for (const prod of productos) {
        expect(typeof prod.id).toBe('number');
        expect(typeof prod.nombre).toBe('string');
        expect(typeof prod.precioBase).toBe('number');
        expect(typeof prod.precio).toBe('number');
        expect(prod.precio).toBeGreaterThan(0);

        if (prod.tipo === 'PASTELERIA') {
          // La pastelería no posee tamaño, gramos ni variedad
          expect(prod.tamano).toBeUndefined();
          expect(prod.gramos).toBeUndefined();
          expect(prod.variedad).toBeUndefined();
          // El precio de pastelería equivale a su precioBase
          expect(prod.precio).toBe(prod.precioBase);
        } else if (prod.tipo === 'CAFE_EXPRESO' || prod.tipo === 'CAFE_FILTRADO') {
          // El café siempre define tamaño, gramos y variedad
          expect(prod.tamano).toBeDefined();
          expect(['POCILLO', 'MEDIANO', 'TAZA_GRANDE']).toContain(prod.tamano);
          expect(typeof prod.gramos).toBe('number');
          expect(prod.gramos).toBeGreaterThan(0);
          expect(['BRASIL', 'COLOMBIA', 'ETIOPIA']).toContain(prod.variedad);
          // El café calcula el precio agregando el recargo por variedad y gramo
          expect(prod.precio).toBeGreaterThan(prod.precioBase);
        }
      }
    });

    test('debe contener los productos iniciales sembrados en la base de datos', async ({ request }) => {
      const response = await request.get('/api/productos');
      expect(response.status()).toBe(200);

      const productos: ProductoResponseDTO[] = await response.json();

      const expresoBrasil = productos.find((p) => p.id === 1);
      expect(expresoBrasil).toBeDefined();
      expect(expresoBrasil?.nombre).toBe('Expreso Pocillo Brasil');
      expect(expresoBrasil?.tipo).toBe('CAFE_EXPRESO');
      expect(expresoBrasil?.precio).toBe(5020);

      const muffin = productos.find((p) => p.id === 19);
      expect(muffin).toBeDefined();
      expect(muffin?.nombre).toBe('Muffin de chocolate');
      expect(muffin?.tipo).toBe('PASTELERIA');
      expect(muffin?.precio).toBe(2500);
    });
  });

  test.describe('GET /api/productos/:id', () => {
    test('debe retornar un café existente con todas sus propiedades y precio calculado', async ({ request }) => {
      const response = await request.get('/api/productos/1');

      expect(response.status()).toBe(200);
      const prod: ProductoResponseDTO = await response.json();

      expect(prod).toMatchObject({
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

    test('debe retornar un producto de pastelería sin propiedades de café', async ({ request }) => {
      const response = await request.get('/api/productos/19');

      expect(response.status()).toBe(200);
      const prod: ProductoResponseDTO = await response.json();

      expect(prod).toMatchObject({
        id: 19,
        nombre: 'Muffin de chocolate',
        tipo: 'PASTELERIA',
        precioBase: 2500,
        precio: 2500,
      });
      expect(prod.tamano).toBeUndefined();
      expect(prod.gramos).toBeUndefined();
      expect(prod.variedad).toBeUndefined();
    });

    test('debe responder 404 cuando el id de producto no existe', async ({ request }) => {
      const response = await request.get('/api/productos/99999');

      expect(response.status()).toBe(404);
      const body = await response.json();
      expect(body).toEqual({ error: 'Producto no encontrado' });
    });

    test('debe responder 400 cuando el id no es un número entero positivo', async ({ request }) => {
      const resString = await request.get('/api/productos/invalido');
      expect(resString.status()).toBe(400);
      expect(await resString.json()).toEqual({ error: 'El id debe ser un número entero positivo' });

      const resNegativo = await request.get('/api/productos/-10');
      expect(resNegativo.status()).toBe(400);
      expect(await resNegativo.json()).toEqual({ error: 'El id debe ser un número entero positivo' });

      const resCero = await request.get('/api/productos/0');
      expect(resCero.status()).toBe(400);
      expect(await resCero.json()).toEqual({ error: 'El id debe ser un número entero positivo' });
    });
  });
});