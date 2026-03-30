import Fastify, { type FastifyInstance } from 'fastify';
import { env } from './config/env.js';
import { bootstrapProducer } from './kafka/client.js';
import { ordersRoute } from './routes/orders.js';

const app: FastifyInstance = Fastify({ logger: { level: env.PRODUCER_LOG_LEVEL } });

export const init = async (): Promise<{ disconnect: () => Promise<void> }> => {
  const { producer, disconnect } = await bootstrapProducer(env);
  app.log.info({ brokers: env.KAFKA_BROKERS }, '[index] Kafka producer conectado');

  app.register(ordersRoute, { prefix: '/orders', producer, env });

  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date() };
  });

  return { disconnect };
};

export default app;
