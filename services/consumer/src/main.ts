import "reflect-metadata";
import pino from "pino";
import { createDataSource } from "./database/data-source.js";
import { bootstrapConsumer } from "./kafka/consumer.js";
import { EnvSchema, type Env } from "./config/env.js";

const logger = pino({ level: process.env["CONSUMER_LOG_LEVEL"] ?? "info" });

// Minimal env loader (no Fastify here — consumer is a pure background worker)
const loadEnv = (): Env => {
  const schema = EnvSchema.properties;
  const get = (key: string, def?: string | number | boolean) =>
    process.env[key] ?? def;

  const required = EnvSchema.required as readonly string[];
  for (const key of required) {
    if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
  }

  return {
    NODE_ENV: String(get("NODE_ENV", "development")),
    KAFKA_BROKERS: String(get("KAFKA_BROKERS")),
    KAFKA_CLIENT_ID: String(get("KAFKA_CLIENT_ID", "kafka-stream-consumer")),
    KAFKA_GROUP_ID_CONSUMER: String(get("KAFKA_GROUP_ID_CONSUMER", "kafka-stream-consumer")),
    KAFKA_TOPIC_ORDERS: String(get("KAFKA_TOPIC_ORDERS", "orders.created")),
    KAFKA_TOPIC_ORDERS_DLQ: String(get("KAFKA_TOPIC_ORDERS_DLQ", "orders.created.dlq")),
    POSTGRES_HOST: String(get("POSTGRES_HOST", "localhost")),
    POSTGRES_PORT: Number(get("POSTGRES_PORT", 5432)),
    POSTGRES_USER: String(get("POSTGRES_USER")),
    POSTGRES_PASSWORD: String(get("POSTGRES_PASSWORD")),
    POSTGRES_DB: String(get("POSTGRES_DB")),
    POSTGRES_SSL: String(get("POSTGRES_SSL", "false")) === "true",
    CONSUMER_LOG_LEVEL: String(get("CONSUMER_LOG_LEVEL", "info")),
    CONSUMER_MAX_RETRIES: Number(get("CONSUMER_MAX_RETRIES", 3)),
    CONSUMER_RETRY_DELAY_MS: Number(get("CONSUMER_RETRY_DELAY_MS", 1000)),
  };
};

const bootstrap = async (): Promise<void> => {
  const env = loadEnv();

  // 1. Connect to PostgreSQL
  logger.info("Connecting to PostgreSQL...");
  const dataSource = createDataSource(env);
  await dataSource.initialize();
  logger.info("PostgreSQL connected");

  // 2. Start Kafka consumer
  logger.info("Starting Kafka consumer...");
  const { disconnect } = await bootstrapConsumer(env, dataSource);

  // 3. Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.warn({ signal }, "Shutdown signal received — closing gracefully");
    await disconnect();           // stop consuming, flush in-flight messages
    await dataSource.destroy();   // close DB connection pool
    logger.info("Shutdown complete");
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));

  // Keep process alive — consumer.run() is non-blocking
  logger.info("Consumer ready — waiting for messages");
};

bootstrap().catch((error) => {
  logger.error({ error }, "Fatal: failed to start consumer");
  process.exit(1);
});
