import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
import { DataSource } from "typeorm";
import { Env } from "../config/env.js";

export const bootstrapConsumer = async (
  env: Env,
  dataSource: DataSource
): Promise<{ disconnect: () => Promise<void> }> => {
  const kafka = new Kafka({
    clientId: env.KAFKA_CLIENT_ID,
    brokers: env.KAFKA_BROKERS.split(","),
  });

  const consumer = kafka.consumer({ groupId: env.KAFKA_GROUP_ID_CONSUMER });

  await consumer.connect();

  await consumer.subscribe({ topic: env.KAFKA_TOPIC_ORDERS, fromBeginning: true });

  await consumer.run({
    eachMessage: async (payload: EachMessagePayload) => {
      const { topic, partition, message } = payload;
      const key = message.key?.toString();
      const value = message.value?.toString();
      
      console.log(`[Consumer] Received message from ${topic}[${partition}]: ${key} = ${value}`);
      
      // Add logic to process event and persist in dataSource here
    },
  });

  const disconnect = async () => {
    await consumer.disconnect();
  };

  return { disconnect };
};
