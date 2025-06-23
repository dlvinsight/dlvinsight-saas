const { Client } = require('pg');

async function testConnection() {
  const password = 'yvYWVYXsrUTZyuKZn21khcKYG+8tkA18+mGCkFYuL2I=';
  const connectionString = `postgresql://postgres:${password}@35.241.144.115:5432/dlvinsight_prod?sslmode=disable`;
  
  console.log('Testing database connection...');
  console.log('Connection string:', connectionString.replace(password, '***'));
  
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log('✅ Database connected successfully!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Current time from DB:', result.rows[0].now);
    
    await client.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error);
  }
}

testConnection();