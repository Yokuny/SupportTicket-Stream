// ─── Event envelope ───────────────────────────────────────────────────────────
// Every Kafka message shares this structure — this is the contract between
// producer and consumer. Never break this shape without a version bump.

export type EventStatus = "received" | "processed" | "failed";

export interface EventMetadata {
  readonly eventId: string;       // UUID v4 — idempotency key
  readonly eventType: string;     // e.g. "order.created"
  readonly version: number;       // schema version — increment on breaking changes
  readonly source: string;        // which service emitted this event
  readonly correlationId?: string; // for distributed tracing
  readonly timestamp: string;     // ISO 8601
}

export interface KafkaEvent<T = unknown> {
  readonly metadata: EventMetadata;
  readonly payload: T;
}

// ─── Order domain ─────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "confirmed" | "cancelled";

export interface OrderCreatedPayload {
  readonly orderId: string;     // external ID from producer
  readonly customerId: string;
  readonly productId: string;
  readonly quantity: number;
  readonly amount: number;
  readonly metadata?: Record<string, unknown>;
}

export type OrderCreatedEvent = KafkaEvent<OrderCreatedPayload>;

// ─── Kafka topic registry ─────────────────────────────────────────────────────
// Single source of truth for all topic names — import this instead of
// hardcoding strings in producer or consumer.

export const Topics = {
  ORDERS_CREATED: "orders.created",
  ORDERS_CREATED_DLQ: "orders.created.dlq",
} as const;

export type Topic = (typeof Topics)[keyof typeof Topics];

// ─── Result type (functional error handling) ──────────────────────────────────
// Avoids throwing exceptions for expected error paths.
// Use: const result = await processOrder(event)
//      if (result.success) ... else console.error(result.error)

export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

export const ok = <T>(data: T): Result<T, never> => ({ success: true, data });

export const err = <E = Error>(error: E): Result<never, E> => ({
  success: false,
  error,
});

export const isOk = <T, E>(r: Result<T, E>): r is { success: true; data: T } =>
  r.success === true;

export const isErr = <T, E>(
  r: Result<T, E>
): r is { success: false; error: E } => r.success === false;

// ─── Functional utilities ─────────────────────────────────────────────────────

/** Left-to-right function composition: pipe(f, g, h)(x) = h(g(f(x))) */
export const pipe =
  <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduce((acc, fn) => fn(acc), value);

/** Maps over a Result — only applies fn if success */
export const mapResult = <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> =>
  result.success ? ok(fn(result.data)) : err(result.error);

/** Chains Result-returning async functions */
export const chainResult = async <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Promise<Result<U, E>>
): Promise<Result<U, E>> =>
  result.success ? fn(result.data) : Promise.resolve(err(result.error));
