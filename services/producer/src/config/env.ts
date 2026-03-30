import { JSONSchemaType } from "ajv";

export interface Env {
  PRODUCER_PORT: number;
  PRODUCER_LOG_LEVEL: string;
  KAFKA_BROKERS: string;
  KAFKA_CLIENT_ID: string;
  KAFKA_TOPIC_ORDERS: string;
  KAFKA_TOPIC_ORDERS_DLQ: string;
}

export const EnvSchema = {
  type: "object",
  required: [
    "PRODUCER_PORT",
    "KAFKA_BROKERS",
    "KAFKA_CLIENT_ID",
    "KAFKA_TOPIC_ORDERS",
    "KAFKA_TOPIC_ORDERS_DLQ"
  ],
  properties: {
    PRODUCER_PORT: { type: "number", default: 3001 },
    PRODUCER_LOG_LEVEL: { type: "string", default: "info" },
    KAFKA_BROKERS: { type: "string" },
    KAFKA_CLIENT_ID: { type: "string", default: "kafka-stream-producer" },
    KAFKA_TOPIC_ORDERS: { type: "string", default: "orders.created" },
    KAFKA_TOPIC_ORDERS_DLQ: { type: "string", default: "orders.created.dlq" },
  },
};
