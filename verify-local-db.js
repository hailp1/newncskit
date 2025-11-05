const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'ncskit',
  user: process.env.POSTGRES_USER || 'user',
  password: process.env.POSTGRES_PASSWORD || 'password',
});

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying local PostgreSQL database...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Check tables
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log(`📊 Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.tablename}`);
    });
    
    // Check sample data
    const usersResult = await client.query('SELECT COUNT(*) FROM users');
    const projectsResult = await client.query('SELECT COUNT(*) FROM projects');
    const businessDomainsResult = await client.query('SELECT COUNT(*) FROM business_domains');
    const marketingModelsResult = await client.query('SELECT COUNT(*) FROM marketing_models');
    
    console.log('\n📈 Data counts:');
    console.log(`👥 Users: ${usersResult.rows[0].count}`);
    console.log(`📁 Projects: ${projectsResult.rows[0].count}`);
    console.log(`🏢 Business Domains: ${businessDomainsResult.rows[0].count}`);
    console.log(`📊 Marketing Models: ${marketingModelsResult.rows[0].count}`);
    
    // Test sample queries
    console.log('\n🔍 Sample data:');
    const domainsResult = await client.query('SELECT name, name_vi FROM business_domains LIMIT 3');
    domainsResult.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.name_vi})`);
    });
    
    const modelsResult = await client.query('SELECT name, abbreviation FROM marketing_models LIMIT 3');
    console.log('\n📋 Marketing Models:');
    modelsResult.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.abbreviation})`);
    });
    
    client.release();
    console.log('\n✅ Database verification completed successfully');
    console.log('\n🎯 Next steps:');
    console.log('1. Start your frontend: cd frontend && npm run dev');
    console.log('2. Test the application at http://localhost:3000');
    console.log('3. Check that blog and dashboard work correctly');
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running: docker-compose up postgres');
    console.log('2. Check environment variables in frontend/.env.local');
    console.log('3. Verify database connection settings');
  } finally {
    await pool.end();
  }
}

verifyDatabase();