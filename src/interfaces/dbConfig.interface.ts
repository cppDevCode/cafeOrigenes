import type { Options } from 'sequelize';

export interface DbConfig {
    database?: string;
    username?: string;
    password?: string;
    host?: string;
    port?: number;
    dialect: NonNullable<Options['dialect']>;
    logging: boolean | ((sql: string, ...params: unknown[]) => void);
    pool?: NonNullable<Options['pool']>;
    dialectOptions?: NonNullable<Options['dialectOptions']>;
}

export interface DatabaseConfig {
    development: DbConfig;
    test: DbConfig;
    production: DbConfig;
}
