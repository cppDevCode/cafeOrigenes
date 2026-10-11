import type { DatabaseConfig } from '../interfaces/dbConfig.interface.js'

export const config: DatabaseConfig = {
  development: {
    username: process.env.DB_USER || 'app_user',
    password: process.env.DB_PASSWORD || 'app_password',
    database: process.env.DB_NAME || 'app_database',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    username: process.env.DB_USER || 'app_user',
    password: process.env.DB_PASSWORD || 'app_password',
    database: process.env.DB_NAME + '_test' || 'app_database_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5433,
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.DB_USER || 'app_user',
    password: process.env.DB_PASSWORD || 'app_password',
    database: process.env.DB_NAME || 'app_database',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5433,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

export default config;