import path from 'node:path';

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';

import * as schema from '@/models/Schema';

import { Env } from './Env';

// Always use production database
const DATABASE_URL = Env.DATABASE_URL || 'postgresql://postgres:yvYWVYXsrUTZyuKZn21khcKYG+8tkA18+mGCkFYuL2I=@35.241.144.115:5432/dlvinsight_prod?sslmode=disable';

const client = new Client({
  connectionString: DATABASE_URL,
});

await client.connect();

const db = drizzle(client, { schema });

// Skip migrations in development if SKIP_DB_MIGRATIONS is set
if (process.env.SKIP_DB_MIGRATIONS !== 'true') {
  try {
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), 'migrations'),
    });
  } catch (error) {
    console.error('Migration error:', error);
    // Continue without failing - migrations might already be applied
  }
}

export { db };
