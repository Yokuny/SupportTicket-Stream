import { env } from './config/env.js';
import app, { init } from './index.js';

const port = env.PRODUCER_PORT || 3000;

init()
  .then(({ disconnect }) => {
    app.listen({ port, host: '0.0.0.0' }, (err, address) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      app.log.info({ port }, `[server] Producer HTTP server ouvindo no endereço: ${address}`);
    });

    const gracefulShutdown = async (signal: string) => {
      app.log.warn({ signal }, `[server] Shutdown signal received (${signal}) — closing gracefully`);
      await app.close();

      if (disconnect) {
        await disconnect();
      }

      app.log.info('[server] Shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  })
  .catch((error) => {
    console.error('Fatal: failed to start server', error);
    process.exit(1);
  });
