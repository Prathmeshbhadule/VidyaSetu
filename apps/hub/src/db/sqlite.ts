import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { runMigrations } from './migrator.js';
import { env } from '../config/env.js';

let dbInstance: Database.Database | null = null;

export function getHubDb(dbPath: string = env.SQLITE_PATH): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  // Ensure target folder exists
  const dir = path.dirname(dbPath);
  if (dir && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);

  // High performance & concurrency SQLite configuration
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');

  // Run migrations
  const migrationsDir = path.join(__dirname, '../../migrations');
  runMigrations(db, migrationsDir);

  dbInstance = db;
  return dbInstance;
}

export function closeHubDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
