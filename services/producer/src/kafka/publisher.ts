import type { KafkaEvent, SupportTicketPayload } from '@kafka-stream/shared';
import type { Producer } from 'kafkajs';
import type { Env } from '../config/env.js';

export const buildSupportTicketCreatedEvent = (payload: SupportTicketPayload): KafkaEvent<SupportTicketPayload> => {
  return {
    metadata: {
      eventId: crypto.randomUUID(),
      eventType: 'support-ticket.created',
      version: 1,
      source: 'producer',
      timestamp: new Date().toISOString(),
    },
    payload,
  };
};

export const publishSupportTicketCreated = async (producer: Producer, env: Env, event: KafkaEvent<SupportTicketPayload>): Promise<void> => {
  await producer.send({
    topic: env.KAFKA_TOPIC_SUPPORT_TICKET,
    messages: [
      {
        key: event.payload.userId,
        value: JSON.stringify(event),
      },
    ],
  });
};
