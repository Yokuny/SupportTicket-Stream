import 'reflect-metadata';
import { AppDataSource } from './database/data-source.js';
import { bootstrapConsumer } from './kafka/consumer.js';

export async function init(): Promise<AppContext> {
  await AppDataSource.initialize();

  const { disconnect } = await bootstrapConsumer();
  return { disconnect };
}

export interface AppContext {
  disconnect: () => Promise<void>;
}
