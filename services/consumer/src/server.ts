import { AppDataSource } from './database/data-source.js';
import { init } from './index.js';

init()
  .then((context) => {
    const gracefulShutdown = async (_signal: string) => {
      await context.disconnect();
      await AppDataSource.destroy();
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  })
  .catch((error) => {
    console.error('[LOG] Fatal: failed to start consumer', error);
    process.exit(1);
  });
