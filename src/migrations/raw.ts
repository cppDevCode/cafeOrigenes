import { sequelize } from '../config/BaseDeDatos.js';

async function migrar() {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
        total DECIMAL(10,2) NOT NULL
      );
    `);
    console.log('Tabla "pedidos" creada (o ya existía)');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS pedido_items (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        precio_unitario DECIMAL(10,2) NOT NULL
      );
    `);
    console.log('Tabla "pedido_items" creada (o ya existía)');

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
    `);
    console.log('Tabla "productos" creada (o ya existía)');

    const [tablas] = await sequelize.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;`
    );
    console.log('Tablas en la base de datos:');
    console.table(tablas);
  } catch (error) {
    console.error('Error al migrar:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrar();