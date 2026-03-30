import 'reflect-metadata';
import { DataSource } from 'typeorm';
import type { Env } from '../config/env.js';
import { SupportTicketEntity } from './entities/index.js';

export const createDataSource = (env: Env): DataSource => {
  return new DataSource({
    type: 'postgres',
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    username: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    ssl: env.POSTGRES_SSL,
    synchronize: false,
    logging: env.CONSUMER_LOG_LEVEL === 'debug',
    entities: [SupportTicketEntity],
    migrations: [],
    subscribers: [],
  });
};
