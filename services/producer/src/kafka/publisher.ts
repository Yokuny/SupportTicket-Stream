import { Producer } from "kafkajs";
import { KafkaEvent, Topics } from "@kafka-stream/shared";
import { Env } from "../config/env.js";

export const buildOrderCreatedEvent = (payload: any): KafkaEvent => {
  return {
    metadata: {
      eventId: crypto.randomUUID(),
      eventType: "order.created",
      version: 1,
      source: "producer",
      timestamp: new Date().toISOString(),
    },
    payload,
  };
};

export const publishOrderCreated = async (
  producer: Producer,
  env: Env,
  event: KafkaEvent
): Promise<void> => {
  await producer.send({
    topic: env.KAFKA_TOPIC_ORDERS,
    messages: [
      {
        key: event.payload.customerId,
        value: JSON.stringify(event),
      },
    ],
  });
};
