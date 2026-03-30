export const Topics = {
  SUPPORT_TICKET_CREATED: 'support-ticket.created',
  SUPPORT_TICKET_CREATED_DLQ: 'support-ticket.created.dlq',
} as const;

export type Topic = (typeof Topics)[keyof typeof Topics];
