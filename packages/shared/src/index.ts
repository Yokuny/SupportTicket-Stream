// ─── Constants ────────────────────────────────────────────────────────────────

export type { Topic } from './constants/topics.js';
export { Topics } from './constants/topics.js';

// ─── Interfaces ───────────────────────────────────────────────────────────────
export type { EventMetadata, EventStatus, KafkaEvent } from './interfaces/event.interface.js';
export type { Result } from './interfaces/result.interface.js';
export type { SupportTicketCreatedEvent, SupportTicketPayload } from './interfaces/support-ticket.interface.js';

// ─── Schemas (Zod) ────────────────────────────────────────────────────────────
export { EventMetadataSchema, KafkaEventSchema } from './schemas/event.schema.js';
export { SupportTicketCreatedEventSchema, SupportTicketPayloadSchema } from './schemas/support-ticket.schema.js';

// ─── Utilities ────────────────────────────────────────────────────────────────
export { pipe } from './utils/pipe.js';
export { chainResult, err, isErr, isOk, mapResult, ok } from './utils/result.js';
