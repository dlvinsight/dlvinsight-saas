import path from 'node:path';

import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';

import * as schema from '@/models/Schema';

import { Env } from './Env';

// Always use production database
// Use direct IP connection for local development, Cloud SQL socket for Cloud Run
const isCloudRun = process.env.K_SERVICE !== undefined;
const DATABASE_URL = Env.DATABASE_URL || (
  isCloudRun 
    ? 'postgresql://postgres:yvYWVYXsrUTZyuKZn21khcKYG+8tkA18+mGCkFYuL2I=@/dlvinsight_prod?host=/cloudsql/dlvinsight-profit-analytics:europe-west1:dlvinsight-db-west1'
    : 'postgresql://postgres:yvYWVYXsrUTZyuKZn21khcKYG+8tkA18+mGCkFYuL2I=@35.241.144.115:5432/dlvinsight_prod?sslmode=disable'
);

let db: NodePgDatabase<typeof schema>;

// During build phase, create a placeholder DB instance
if (process.env.NEXT_PHASE === 'phase-production-build') {
  console.log('Build phase detected - using placeholder database connection');
  // Create a minimal db object that won't fail during build
  db = new Proxy({} as NodePgDatabase<typeof schema>, {
    get() {
      return () => {
        throw new Error('Database operations not available during build');
      };
    }
  });
} else {
  // Normal runtime database connection
  try {
    const client = new Client({
      connectionString: DATABASE_URL,
    });

    await client.connect();
    console.log('Database connected successfully');

    db = drizzle(client, { schema });

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
  } catch (error) {
    console.error('Database connection error:', error);
    // For API routes during runtime, we need to handle this properly
    throw error;
  }
}

export { db };
