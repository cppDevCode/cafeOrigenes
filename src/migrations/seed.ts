import 'dotenv/config';
import { sequelize } from '../config/BaseDeDatos.js';

interface ProductoSeed {
  id: number;
  nombre: string;
  tipo: 'CAFE_EXPRESO' | 'CAFE_FILTRADO' | 'PASTELERIA';
  precioBase: number;
  tamano?: 'POCILLO' | 'MEDIANO' | 'TAZA_GRANDE' | null;
  gramos?: number | null;
  variedad?: 'BRASIL' | 'COLOMBIA' | 'ETIOPIA' | null;
}

const productosIniciales: ProductoSeed[] = [
  { id: 1, nombre: 'Café Expreso Pocillo (Colombia)', tipo: 'CAFE_EXPRESO', precioBase: 2500, tamano: 'POCILLO', gramos: 10, variedad: 'COLOMBIA' },
  { id: 2, nombre: 'Café Expreso Mediano (Brasil)', tipo: 'CAFE_EXPRESO', precioBase: 3200, tamano: 'MEDIANO', gramos: 15, variedad: 'BRASIL' },
  { id: 3, nombre: 'Café Filtrado Pocillo (Etiopía)', tipo: 'CAFE_FILTRADO', precioBase: 2800, tamano: 'POCILLO', gramos: 12, variedad: 'ETIOPIA' },
  { id: 4, nombre: 'Café Filtrado Taza Grande (Colombia)', tipo: 'CAFE_FILTRADO', precioBase: 3800, tamano: 'TAZA_GRANDE', gramos: 20, variedad: 'COLOMBIA' },
  { id: 5, nombre: 'Café Expreso Flat White (Brasil)', tipo: 'CAFE_EXPRESO', precioBase: 4200, tamano: 'MEDIANO', gramos: 18, variedad: 'BRASIL' },
  { id: 6, nombre: 'Medialuna de Manteca', tipo: 'PASTELERIA', precioBase: 1200, tamano: null, gramos: null, variedad: null },
  { id: 7, nombre: 'Croissant de Almendras', tipo: 'PASTELERIA', precioBase: 2600, tamano: null, gramos: null, variedad: null },
  { id: 8, nombre: 'Tarta de Manzana Artesanal', tipo: 'PASTELERIA', precioBase: 3500, tamano: null, gramos: null, variedad: null },
  { id: 9, nombre: 'Cheesecake de Frutos Rojos', tipo: 'PASTELERIA', precioBase: 4500, tamano: null, gramos: null, variedad: null },
  { id: 10, nombre: 'Alfajor Marplatense de Chocolate', tipo: 'PASTELERIA', precioBase: 1800, tamano: null, gramos: null, variedad: null },
];

export async function sembrar150Datos(): Promise<void> {
  try {
    console.log('--- Iniciando migración y sembrado de 150 datos de prueba ---');
    await sequelize.authenticate();
    console.log('Conexión con PostgreSQL establecida correctamente.');

    // 1. Crear tablas si no existen (idéntico a raw.ts con constraints)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        tipo VARCHAR(20) NOT NULL
          CHECK (tipo IN ('CAFE_EXPRESO', 'CAFE_FILTRADO', 'PASTELERIA')),
        precio_base INTEGER NOT NULL CHECK (precio_base > 0),
        tamano VARCHAR(20)
          CHECK (tamano IN ('POCILLO', 'MEDIANO', 'TAZA_GRANDE')),
        gramos INTEGER CHECK (gramos > 0),
        variedad VARCHAR(20)
          CHECK (variedad IN ('BRASIL', 'COLOMBIA', 'ETIOPIA')),

        CONSTRAINT chk_cafe_o_pasteleria CHECK (
          (tipo = 'PASTELERIA'
            AND tamano IS NULL AND gramos IS NULL AND variedad IS NULL)
          OR
          (tipo IN ('CAFE_EXPRESO', 'CAFE_FILTRADO')
            AND tamano IS NOT NULL AND gramos IS NOT NULL AND variedad IS NOT NULL)
        )
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

    // 3. Insertar productos cumpliendo la constraint chk_cafe_o_pasteleria
    for (const prod of productosIniciales) {
      await sequelize.query(
        `INSERT INTO productos (id, nombre, tipo, precio_base, tamano, gramos, variedad)
         VALUES (:id, :nombre, :tipo, :precioBase, :tamano, :gramos, :variedad);`,
        {
          replacements: {
            id: prod.id,
            nombre: prod.nombre,
            tipo: prod.tipo,
            precioBase: prod.precioBase,
            tamano: prod.tamano ?? null,
            gramos: prod.gramos ?? null,
            variedad: prod.variedad ?? null,
          },
        }
      );
    }
    console.log(`Se insertaron ${productosIniciales.length} productos en el catálogo cumpliendo constraints.`);

    // 4. Generar 150 pedidos con sus respectivos items
    // Distribución: 115 ENTREGADO, 25 PENDIENTE, 10 CANCELADO
    const estados: string[] = [
      ...Array<string>(115).fill('ENTREGADO'),
      ...Array<string>(25).fill('PENDIENTE'),
      ...Array<string>(10).fill('CANCELADO'),
    ];

    let totalFacturacionEntregados = 0;
    const ventasPorProducto = new Map<number, number>();
    let totalItemsGenerados = 0;

    for (let i = 1; i <= 150; i++) {
      const estado = estados[i - 1] ?? 'ENTREGADO';

      // Cada pedido tendrá entre 1 y 3 items
      const cantidadItems = (i % 3) + 1;
      const itemsDelPedido: { productoId: number; cantidad: number; precioUnitario: number; subtotal: number }[] = [];

      for (let j = 0; j < cantidadItems; j++) {
        const prodIndex = (i * 3 + j * 7) % productosIniciales.length;
        const producto = productosIniciales[prodIndex] ?? productosIniciales[0]!;
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
      const [pedidoInsertResult] = (await sequelize.query(
        `INSERT INTO pedidos (estado, total) VALUES (:estado, :total) RETURNING id;`,
        {
          replacements: { estado, total: totalPedido },
        }
      )) as [{ id: number }[], unknown];

      const primerPedido = pedidoInsertResult[0];
      if (!primerPedido) {
        throw new Error('Error al insertar pedido: no se obtuvo ID');
      }
      const pedidoId = primerPedido.id;

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
  }
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  sembrar150Datos()
    .then(() => sequelize.close())
    .catch(() => process.exit(1));
}

