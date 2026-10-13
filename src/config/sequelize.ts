import 'dotenv/config';
import { Sequelize } from 'sequelize';
import config from './BaseDeDatos.js';

const entorno =
  process.env.NODE_ENV === 'production'
    ? 'production'
    : process.env.NODE_ENV === 'test'
      ? 'test'
      : 'development';

export const sequelize = new Sequelize(config[entorno]);
