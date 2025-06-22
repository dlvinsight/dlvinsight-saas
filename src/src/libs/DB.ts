import path from 'node:path';

import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import { drizzle as drizzlePglite, type PgliteDatabase } from 'drizzle-orm/pglite';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import { PHASE_PRODUCTION_BUILD } from 'next/dist/shared/lib/constants';
import { Client } from 'pg';

import * as schema from '@/models/Schema';

import { Env } from './Env';

let client;
let drizzle;

if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD && Env.DATABASE_URL) {
  client = new Client({
    connectionString: Env.DATABASE_URL,
  });
  await client.connect();

  drizzle = drizzlePg(client, { schema });
  
  // Skip migrations in development if SKIP_DB_MIGRATIONS is set
  if (process.env.SKIP_DB_MIGRATIONS !== 'true') {
    try {
      await migratePg(drizzle, {
        migrationsFolder: path.join(process.cwd(), 'migrations'),
      });
    } catch (error) {
      console.error('Migration error:', error);
      // Continue without failing - migrations might already be applied
    }
  }
} else {
  // Stores the db connection in the global scope to prevent multiple instances due to hot reloading with Next.js
  const global = globalThis as unknown as { client: PGlite; drizzle: PgliteDatabase<typeof schema> };

  if (!global.client) {
    global.client = new PGlite();
    await global.client.waitReady;

    global.drizzle = drizzlePglite(global.client, { schema });
  }

  drizzle = global.drizzle;
  // Skip migrations for PGlite during build
  if (process.env.SKIP_DB_MIGRATIONS !== 'true') {
    try {
      await migratePglite(global.drizzle, {
        migrationsFolder: path.join(process.cwd(), 'migrations'),
      });
    } catch (error) {
      console.error('PGlite migration error:', error);
      // Continue without failing - PGlite is only for build time
    }
  }
}

export const db = drizzle;
