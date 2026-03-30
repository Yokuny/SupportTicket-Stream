import { Kafka, type Producer } from 'kafkajs';
import { env } from '../config/env.js';

export const bootstrapProducer = async (): Promise<{ producer: Producer; disconnect: () => Promise<void> }> => {
  const kafka = new Kafka({
    clientId: env.KAFKA_CLIENT_ID,
    brokers: env.KAFKA_BROKERS.split(','),
  });

  const producer = kafka.producer();

  await producer.connect();

  const disconnect = async () => {
    await producer.disconnect();
  };

  return { producer, disconnect };
};
