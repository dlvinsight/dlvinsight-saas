import { Pool } from 'pg';

async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://admin@localhost:5432/dlvinsight_dev',
  });

  try {
    // Test query - count tables
    const result = await pool.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log('✅ Database connection successful!');
    console.log(`📊 Found ${result.rows[0].table_count} tables in the database`);

    // List all tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\n📋 Tables:');
    tables.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await pool.end();
  }
}

testConnection();
