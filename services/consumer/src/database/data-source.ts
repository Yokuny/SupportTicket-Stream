import "reflect-metadata";
import { DataSource } from "typeorm";
import { Env } from "../config/env.js";

export const createDataSource = (env: Env): DataSource => {
  return new DataSource({
    type: "postgres",
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    username: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    ssl: env.POSTGRES_SSL,
    synchronize: false, // Use migrations in production!
    logging: env.CONSUMER_LOG_LEVEL === "debug",
    entities: [
      // entities will be added here
    ],
    migrations: [],
    subscribers: [],
  });
};
