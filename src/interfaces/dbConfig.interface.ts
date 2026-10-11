import type { Options } from 'sequelize';

export interface DbConfig {
    database?: string;
    username?: string;
    password?: string;
    host?: string;
    port?: number | string;
    dialect: Options['dialect'];
    logging: boolean | ((sql: string, ...params: unknown[]) => void);
    pool?: Options['pool'];
    dialectOptions?: Options['dialectOptions'];
}

export interface DatabaseConfig {
    development: DbConfig;
    test: DbConfig;
    production: DbConfig;
}