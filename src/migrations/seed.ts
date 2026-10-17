import 'dotenv/config';
import { sequelize } from '../config/BaseDeDatos.js';

interface ProductoSeed {
  id: number;
  nombre: string;
  tipo: string;
  precioBase: number;
}

const productosIniciales: ProductoSeed[] = [
  { id: 1, nombre: 'Café Expreso Pocillo (Colombia)', tipo: 'CAFE_EXPRESO', precioBase: 2500 },
  { id: 2, nombre: 'Café Expreso Mediano (Brasil)', tipo: 'CAFE_EXPRESO', precioBase: 3200 },
  { id: 3, nombre: 'Café Filtrado Pocillo (Etiopía)', tipo: 'CAFE_FILTRADO', precioBase: 2800 },
  { id: 4, nombre: 'Café Filtrado Taza Grande (Colombia)', tipo: 'CAFE_FILTRADO', precioBase: 3800 },
  { id: 5, nombre: 'Flat White Doble', tipo: 'CAFE_EXPRESO', precioBase: 4200 },
  { id: 6, nombre: 'Medialuna de Manteca', tipo: 'PASTELERIA', precioBase: 1200 },
  { id: 7, nombre: 'Croissant de Almendras', tipo: 'PASTELERIA', precioBase: 2600 },
  { id: 8, nombre: 'Tarta de Manzana Artesanal', tipo: 'PASTELERIA', precioBase: 3500 },
  { id: 9, nombre: 'Cheesecake de Frutos Rojos', tipo: 'PASTELERIA', precioBase: 4500 },
  { id: 10, nombre: 'Alfajor Marplatense de Chocolate', tipo: 'PASTELERIA', precioBase: 1800 },
];

export async function sembrar150Datos() {
  try {
    console.log('--- Iniciando migración y sembrado de 150 datos de prueba ---');
    await sequelize.authenticate();
    console.log('Conexión con PostgreSQL establecida correctamente.');

    // 1. Crear tablas si no existen
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        precio_base DECIMAL(10, 2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
        total DECIMAL(10, 2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pedido_items (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        precio_unitario DECIMAL(10, 2) NOT NULL
      );

      CREATE OR REPLACE VIEW items_pedido AS
        SELECT id, pedido_id, producto_id, cantidad, precio_unitario FROM pedido_items;
    `);
    console.log('Tablas y vistas verificadas/creadas (productos, pedidos, pedido_items, vista items_pedido).');

    // 2. Limpiar datos existentes de forma segura
    await sequelize.query('TRUNCATE TABLE pedido_items, pedidos, productos RESTART IDENTITY CASCADE;');

    // 3. Insertar productos
    for (const prod of productosIniciales) {
      await sequelize.query(
        `INSERT INTO productos (id, nombre, tipo, precio_base) VALUES (:id, :nombre, :tipo, :precioBase);`,
        { replacements: prod }
      );
    }
    console.log(`Se insertaron ${productosIniciales.length} productos en el catálogo.`);

    // 4. Generar 150 pedidos con sus respectivos items
    // Distribución: 115 ENTREGADO, 25 PENDIENTE, 10 CANCELADO
    const estados = [
      ...Array(115).fill('ENTREGADO'),
      ...Array(25).fill('PENDIENTE'),
      ...Array(10).fill('CANCELADO'),
    ];

    let totalFacturacionEntregados = 0;
    const ventasPorProducto = new Map<number, number>();
    let totalItemsGenerados = 0;

    for (let i = 1; i <= 150; i++) {
      const estado = estados[i - 1];

      // Cada pedido tendrá entre 1 y 3 items
      // Usamos una lógica pseudoaleatoria determinística basada en el índice
      const cantidadItems = (i % 3) + 1;
      const itemsDelPedido: { productoId: number; cantidad: number; precioUnitario: number; subtotal: number }[] = [];

      for (let j = 0; j < cantidadItems; j++) {
        // Seleccionamos un producto variando con i y j
        const prodIndex = (i * 3 + j * 7) % productosIniciales.length;
        const producto = productosIniciales[prodIndex];
        const cantidad = ((i + j) % 4) + 1; // Entre 1 y 4 unidades
        const precioUnitario = producto.precioBase;
        const subtotal = cantidad * precioUnitario;

        itemsDelPedido.push({
          productoId: producto.id,
          cantidad,
          precioUnitario,
          subtotal,
        });

        if (estado === 'ENTREGADO') {
          ventasPorProducto.set(
            producto.id,
            (ventasPorProducto.get(producto.id) ?? 0) + cantidad
          );
        }
      }

      const totalPedido = itemsDelPedido.reduce((acc, item) => acc + item.subtotal, 0);

      if (estado === 'ENTREGADO') {
        totalFacturacionEntregados += totalPedido;
      }

      // Insertar pedido
      const [pedidoInsertResult] = await sequelize.query(
        `INSERT INTO pedidos (estado, total) VALUES (:estado, :total) RETURNING id;`,
        {
          replacements: { estado, total: totalPedido },
        }
      ) as [{ id: number }[], unknown];

      const pedidoId = pedidoInsertResult[0].id;

      // Insertar items del pedido
      for (const item of itemsDelPedido) {
        await sequelize.query(
          `INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario)
           VALUES (:pedidoId, :productoId, :cantidad, :precioUnitario);`,
          {
            replacements: {
              pedidoId,
              productoId: item.productoId,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
            },
          }
        );
        totalItemsGenerados++;
      }
    }

    // Calcular el producto más vendido
    let masVendidoId = 1;
    let maxVendidoCantidad = 0;
    for (const [prodId, cant] of ventasPorProducto.entries()) {
      if (cant > maxVendidoCantidad) {
        maxVendidoCantidad = cant;
        masVendidoId = prodId;
      }
    }
    const productoMasVendido = productosIniciales.find((p) => p.id === masVendidoId);

    console.log('\n================ RESUMEN DE LA MIGRACIÓN ================');
    console.log(`✓ Total de pedidos creados: 150`);
    console.log(`  - Entregados: 115`);
    console.log(`  - Pendientes: 25`);
    console.log(`  - Cancelados: 10`);
    console.log(`✓ Total de ítems de pedido generados: ${totalItemsGenerados}`);
    console.log(`✓ Facturación total acumulada esperada (GET /reportes/facturacion): $${totalFacturacionEntregados.toLocaleString('es-AR')}`);
    console.log(`✓ Producto más vendido esperado (GET /reportes/mas-vendido):`);
    console.log(`  ID: ${masVendidoId} - "${productoMasVendido?.nombre}" con ${maxVendidoCantidad} unidades vendidas.`);
    console.log('=========================================================\n');
    console.log('Migración completada con éxito. Ya puedes probar todos los endpoints de la API.');
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
sembrar150Datos();

