import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';

const dbPath = process.env.DATABASE_URL || 'sqlite.db';

// Create the bun:sqlite client
const sqlite = new Database(dbPath);

// Export the Drizzle ORM instance
export const db = drizzle(sqlite, { schema });
