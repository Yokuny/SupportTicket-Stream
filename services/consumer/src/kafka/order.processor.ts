import type { OrderCreatedEvent, Result } from '@kafka-stream/shared';
import { err, OrderCreatedEventSchema, ok } from '@kafka-stream/shared';

export const parseOrderEvent = (raw: string | null | undefined): Result<OrderCreatedEvent> => {
  if (!raw) return err(new Error('Empty message value'));

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return err(new Error('Invalid JSON'));
  }

  const result = OrderCreatedEventSchema.safeParse(parsed);

  if (!result.success) {
    return err(new Error(`Schema validation failed: ${result.error.message}`));
  }

  return ok(result.data as OrderCreatedEvent);
};
