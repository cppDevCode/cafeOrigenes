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