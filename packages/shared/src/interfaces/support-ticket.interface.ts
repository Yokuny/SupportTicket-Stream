import type { z } from 'zod';
import type { SupportTicketPayloadSchema } from '../schemas/support-ticket.schema.js';
import type { KafkaEvent } from './event.interface.js';

export type SupportTicketPayload = z.infer<typeof SupportTicketPayloadSchema>;

export type SupportTicketCreatedEvent = KafkaEvent<SupportTicketPayload>;
