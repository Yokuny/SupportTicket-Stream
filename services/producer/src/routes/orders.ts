import { OrderCreatedPayloadSchema } from '@kafka-stream/shared';
import type { FastifyPluginAsync } from 'fastify';
import type { Producer } from 'kafkajs';
import type { z } from 'zod';
import type { Env } from '../config/env.js';
import { buildOrderCreatedEvent, publishOrderCreated } from '../kafka/publisher.js';
import { validBody } from '../middlewares/index.js';

export interface RouteOptions {
  producer: Producer;
  env: Env;
}

export const ordersRoute: FastifyPluginAsync<RouteOptions> = async (app, options) => {
  const { producer, env } = options;

  app.post('/', { preHandler: validBody(OrderCreatedPayloadSchema) }, async (request, reply) => {
    const data = request.body as z.infer<typeof OrderCreatedPayloadSchema>;
    console.log('[orders]: body recebido: ', data);

    const event = buildOrderCreatedEvent(data);
    console.log('[orders]: event construído: ', event);

    try {
      await publishOrderCreated(producer, env, event);
      return reply.status(201).send({ status: 'Order placed', eventId: event.metadata.eventId });
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Failed to place order' });
    }
  });
};
