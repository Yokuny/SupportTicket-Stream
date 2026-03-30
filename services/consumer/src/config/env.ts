export interface Env {
  NODE_ENV: string;
  KAFKA_BROKERS: string;
  KAFKA_CLIENT_ID: string;
  KAFKA_GROUP_ID_CONSUMER: string;
  KAFKA_TOPIC_ORDERS: string;
  KAFKA_TOPIC_ORDERS_DLQ: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  POSTGRES_SSL: boolean;
  CONSUMER_LOG_LEVEL: string;
  CONSUMER_MAX_RETRIES: number;
  CONSUMER_RETRY_DELAY_MS: number;
}

export const EnvSchema = {
  type: "object",
  required: [
    "KAFKA_BROKERS",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_DB"
  ],
  properties: {
    NODE_ENV: { type: "string" },
    KAFKA_BROKERS: { type: "string" },
    KAFKA_CLIENT_ID: { type: "string" },
    KAFKA_GROUP_ID_CONSUMER: { type: "string" },
    KAFKA_TOPIC_ORDERS: { type: "string" },
    KAFKA_TOPIC_ORDERS_DLQ: { type: "string" },
    POSTGRES_HOST: { type: "string" },
    POSTGRES_PORT: { type: "number" },
    POSTGRES_USER: { type: "string" },
    POSTGRES_PASSWORD: { type: "string" },
    POSTGRES_DB: { type: "string" },
    POSTGRES_SSL: { type: "boolean" },
    CONSUMER_LOG_LEVEL: { type: "string" },
    CONSUMER_MAX_RETRIES: { type: "number" },
    CONSUMER_RETRY_DELAY_MS: { type: "number" },
  },
};
