import path from 'node:path';

import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

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
let pool: Pool | null = null;

// During build phase, create a placeholder DB instance
if (process.env.NEXT_PHASE === 'phase-production-build') {
  console.log('Build phase detected - using placeholder database connection');
  // Create a minimal db object that won't fail during build
  db = new Proxy({} as NodePgDatabase<typeof schema>, {
    get() {
      return () => {
        throw new Error('Database operations not available during build');
      };
    },
  });
} else {
  // Normal runtime database connection with fallback
  let connectionError: any;

  try {
    pool = new Pool({
      connectionString: DATABASE_URL,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
      connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
    });

    // Test the connection
    const client = await pool.connect();
    client.release();
    console.log('Database pool created successfully');

    db = drizzle(pool, { schema });

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
    connectionError = error;
    console.error('Initial database connection error:', error);

    // If we're on Cloud Run and the socket connection failed, try direct IP
    if (isCloudRun && DATABASE_URL.includes('/cloudsql/')) {
      console.log('Attempting fallback to direct IP connection...');

      try {
        const fallbackUrl = 'postgresql://postgres:yvYWVYXsrUTZyuKZn21khcKYG+8tkA18+mGCkFYuL2I=@35.241.144.115:5432/dlvinsight_prod';
        pool = new Pool({
          connectionString: fallbackUrl,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        });

        // Test the connection
        const client = await pool.connect();
        client.release();
        console.log('Fallback database pool created successfully');

        db = drizzle(pool, { schema });

        // Clear the error since we connected successfully
        connectionError = null;
      } catch (fallbackError) {
        console.error('Fallback connection also failed:', fallbackError);
        // Keep the original error
      }
    }

    // If we still have an error, throw it
    if (connectionError) {
      throw connectionError;
    }
  }
}

// Cleanup function to close all connections
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    console.log('Database pool closed');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});

export { db };
