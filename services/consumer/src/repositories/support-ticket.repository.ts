import { AppDataSource } from '../database/data-source.js';
import type { SupportTicket } from '../database/entities/index.js';
import { SupportTicketEntity } from '../database/entities/index.js';

export const saveSupportTicket = async (ticket: SupportTicket): Promise<SupportTicket> => {
  const repo = AppDataSource.getRepository(SupportTicketEntity);
  return repo.save(ticket);
};
