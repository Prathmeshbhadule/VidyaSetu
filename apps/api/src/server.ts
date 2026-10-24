import http from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './db/prisma.js';

const server = http.createServer(app);

server.listen(env.PORT, () => {
  logger.info(`Vidya Setu Cloud API running on port ${env.PORT} [${env.NODE_ENV}]`);
  logger.info(`API Documentation: http://localhost:${env.PORT}/docs`);
  logger.info(`Health check: http://localhost:${env.PORT}/healthz`);
});

// Graceful shutdown
async function handleShutdown(signal: string) {
  logger.info({ signal }, 'Graceful shutdown initiated');

  server.close(async () => {
    logger.info('HTTP server closed');
    try {
      await prisma.$disconnect();
      logger.info('Database connection closed');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during database disconnection');
      process.exit(1);
    }
  });

  // Force shutdown if cleanup hangs
  setTimeout(() => {
    logger.error('Shutdown timeout exceeded. Forcing exit.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
