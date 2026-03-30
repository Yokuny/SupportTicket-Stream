import { type EachMessagePayload, Kafka } from 'kafkajs';
import { env } from '../config/env.js';

import { saveSupportTicket } from '../repositories/index.js';
import { parseSupportTicketEvent } from './support-ticket.processor.js';

export const bootstrapConsumer = async (): Promise<{ disconnect: () => Promise<void> }> => {
  const kafka = new Kafka({
    clientId: env.KAFKA_CLIENT_ID,
    brokers: env.KAFKA_BROKERS.split(','),
  });

  console.log('[LOG] inscrevendo no tópico', env.KAFKA_TOPIC_SUPPORT_TICKET);
  const consumer = kafka.consumer({ groupId: env.KAFKA_GROUP_ID_CONSUMER });
  await consumer.connect();
  await consumer.subscribe({ topic: env.KAFKA_TOPIC_SUPPORT_TICKET, fromBeginning: true });

  await consumer.run({
    eachMessage: async (payload: EachMessagePayload) => {
      const { topic, partition, message } = payload;
      const result = parseSupportTicketEvent(message.value?.toString());

      if (!result.success) {
        return;
      }

      const event = result.data;
      console.log({ eventId: event.metadata.eventId, eventType: event.metadata.eventType, topic, partition }, 'Event received');

      await saveSupportTicket({
        ...event.payload,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    },
  });

  const disconnect = async () => {
    await consumer.disconnect();
  };

  return { disconnect };
};
