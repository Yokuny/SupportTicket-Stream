import { z } from 'zod';

const envSchema = z.object({
  PRODUCER_PORT: z.coerce.number().int().default(3001),
  PRODUCER_LOG_LEVEL: z.string().default('info'),
  KAFKA_BROKERS: z.string(),
  KAFKA_CLIENT_ID: z.string().default('producer-name'),
  KAFKA_TOPIC_ORDERS: z.string().default('orders.created'),
  KAFKA_TOPIC_ORDERS_DLQ: z.string().default('orders.created.dlq'),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
