import { EntitySchema } from 'typeorm';

export interface SupportTicket {
  ticketId: string;
  userId: string;
  currentPage: string;
  previousPage: string;
  message: string;
  currentError: string;
  createdAt: Date;
  updatedAt: Date;
}

export const SupportTicketEntity = new EntitySchema<SupportTicket>({
  name: 'support_tickets',
  columns: {
    ticketId: { type: 'varchar', primary: true, name: 'ticket_id' },
    userId: { type: 'varchar', name: 'user_id' },
    currentPage: { type: 'varchar', name: 'current_page' },
    previousPage: { type: 'varchar', name: 'previous_page' },
    message: { type: 'text' },
    currentError: { type: 'text', name: 'current_error' },
    createdAt: { type: 'timestamp', name: 'created_at', createDate: true },
    updatedAt: { type: 'timestamp', name: 'updated_at', updateDate: true },
  },
});
