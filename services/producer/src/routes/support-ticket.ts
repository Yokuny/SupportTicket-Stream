import { SupportTicketPayloadSchema } from '@kafka-stream/shared';
import type { FastifyPluginAsync } from 'fastify';
import type { Producer } from 'kafkajs';
import type { z } from 'zod';
import type { Env } from '../config/env.js';
import { buildSupportTicketCreatedEvent, publishSupportTicketCreated } from '../kafka/publisher.js';
import { validBody } from '../middlewares/index.js';

export const supportTicketRoute: FastifyPluginAsync<RouteOptions> = async (app, options) => {
  const { producer, env } = options;

  app.post('/', { preHandler: validBody(SupportTicketPayloadSchema) }, async (request, reply) => {
    const data = request.body as z.infer<typeof SupportTicketPayloadSchema>;
    console.log('[support-ticket]: body recebido: ', data);

    const event = buildSupportTicketCreatedEvent(data);
    console.log('[support-ticket]: event construído: ', event);

    try {
      await publishSupportTicketCreated(producer, env, event);
      return reply.status(201).send({ status: 'Support ticket created', eventId: event.metadata.eventId });
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Failed to create support ticket' });
    }
  });
};

export interface RouteOptions {
  producer: Producer;
  env: Env;
}
