import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { getHubDb, closeHubDb } from './db/sqlite.js';
import { HubSyncService } from './services/hub-sync.service.js';

// Initialize SQLite database and run versioned migrations
getHubDb();

const server = app.listen(env.PORT, () => {
  logger.info(`Vidya Setu School Hub running on port ${env.PORT} [${env.NODE_ENV}]`);
  logger.info(`School ID: ${env.SCHOOL_ID}`);
  logger.info(`Target Cloud Sync URL: ${env.CLOUD_SYNC_URL}`);
});

// Periodic background cloud synchronizer
const hubSync = new HubSyncService();
const syncInterval = setInterval(async () => {
  try {
    const outcome = await hubSync.syncWithCloud();
    if (outcome.cloudReachable) {
      logger.info(
        { pushed: outcome.pushedCount, pulled: outcome.pulledCount },
        'Background cloud sync successful'
      );
    }
  } catch (err: any) {
    logger.debug({ err: err.message }, 'Background cloud sync skipped (cloud offline)');
  }
}, env.SYNC_INTERVAL_MS);

function shutdown() {
  logger.info('Shutting down School Hub...');
  clearInterval(syncInterval);
  server.close(() => {
    closeHubDb();
    logger.info('School Hub SQLite closed. Goodbye.');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
