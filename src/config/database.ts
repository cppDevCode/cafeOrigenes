import { Sequelize, type Options } from 'sequelize';
import type { DatabaseConfig } from '../interfaces/dbConfig.interface.js';
import { config } from './BaseDeDatos.js'; 

const entorno = (process.env.NODE_ENV ?? 'development') as keyof DatabaseConfig;
const { port, ...resto } = config[entorno];

export const sequelize = new Sequelize({
  ...resto,
  ...(port !== undefined ? { port: Number(port) } : {}),
} as Options);