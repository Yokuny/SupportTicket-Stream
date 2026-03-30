import { FastifyInstance } from "fastify";
import { Producer } from "kafkajs";
import { Env } from "../config/env.js";
import { buildOrderCreatedEvent, publishOrderCreated } from "../kafka/publisher.js";

export const registerOrderRoutes = (
  app: FastifyInstance,
  producer: Producer,
  env: Env
): void => {
  app.post("/orders", async (request, reply) => {
    const payload = request.body;

    const event = buildOrderCreatedEvent(payload);

    try {
      await publishOrderCreated(producer, env, event);
      return reply.status(201).send({ status: "Order placed", eventId: event.metadata.eventId });
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: "Failed to place order" });
    }
  });

  app.get("/health", async () => {
    return { status: "healthy" };
  });
};
