import { z } from 'zod';
import { KafkaEventSchema } from './event.schema.js';

export const SupportTicketPayloadSchema = z.object({
  ticketId: z.string(),
  userId: z.string(),
  currentPage: z.string(),
  previousPage: z.string(),
  message: z.string(),
  currentError: z.string(),
});

export const SupportTicketCreatedEventSchema = KafkaEventSchema.extend({
  payload: SupportTicketPayloadSchema,
});
