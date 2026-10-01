/*
 * Author: Jamius Siam
 * Since: 02/10/2026
 */
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { env } from './env.js';

mkdirSync(dirname(env.databasePath), { recursive: true });

const sqlite = new Database(env.databasePath);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle({ client: sqlite });

// Resolves to backend/drizzle from both src/ (tsx) and dist/ (built)
migrate(db, { migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)) });
