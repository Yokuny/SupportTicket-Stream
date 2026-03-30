import type { DataSource } from 'typeorm';
import type { SupportTicket } from '../database/entities/index.js';
import { SupportTicketEntity } from '../database/entities/index.js';

export const saveSupportTicket = async (dataSource: DataSource, ticket: SupportTicket): Promise<SupportTicket> => {
  const repo = dataSource.getRepository(SupportTicketEntity);
  return repo.save(ticket);
};
