import Fastify from "fastify";
import fastifyEnv from "@fastify/env";
import { bootstrapProducer } from "./kafka/client.js";
import { registerOrderRoutes } from "./routes/orders.js";
import { EnvSchema, type Env } from "./config/env.js";

const bootstrap = async (): Promise<void> => {
  const app = Fastify({ logger: { level: process.env["PRODUCER_LOG_LEVEL"] ?? "info" } });

  // 1. Validate and load environment variables
  await app.register(fastifyEnv, { schema: EnvSchema, dotenv: true });
  const env = app.config as unknown as Env;

  // 2. Connect to Kafka
  app.log.info("Connecting to Kafka...");
  const { producer, disconnect } = await bootstrapProducer(env);
  app.log.info({ brokers: env.KAFKA_BROKERS }, "Kafka producer connected");

  // 3. Register routes
  registerOrderRoutes(app, producer, env);

  // 4. Graceful shutdown — always disconnect from Kafka cleanly
  // This prevents messages from being lost mid-flight on SIGTERM (k8s pod eviction)
  const shutdown = async (signal: string): Promise<void> => {
    app.log.warn({ signal }, "Shutdown signal received — closing gracefully");
    await app.close();        // stop accepting new HTTP requests
    await disconnect();       // flush and disconnect Kafka producer
    app.log.info("Shutdown complete");
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));

  // 5. Start HTTP server
  await app.listen({ port: env.PRODUCER_PORT, host: "0.0.0.0" });
  app.log.info({ port: env.PRODUCER_PORT }, "Producer HTTP server listening");
};

bootstrap().catch((error) => {
  console.error("Fatal: failed to start producer", error);
  process.exit(1);
});
