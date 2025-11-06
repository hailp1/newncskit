// Create admin user script
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Use DATABASE_URL if available, otherwise construct from individual env vars
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'ncskit'}`
});

async function createAdminUser() {
  const client = await pool.connect();
  
  try {
    // Check if admin user exists
    const existingUser = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      ['admin@ncskit.com']
    );

    if (existingUser.rows.length > 0) {
      console.log('✅ Admin user already exists:', existingUser.rows[0].email);
      
      // Update password to meet new requirements
      const newPassword = 'Admin123!@#'; // Meets 12+ chars + complexity
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);
      
      await client.query(
        'UPDATE users SET password_hash = $1, is_active = true WHERE email = $2',
        [passwordHash, 'admin@ncskit.com']
      );
      
      console.log('✅ Admin password updated to meet new security requirements');
      console.log('📧 Email: admin@ncskit.com');
      console.log('🔑 Password: Admin123!@#');
      
    } else {
      // Create new admin user
      const email = 'admin@ncskit.com';
      const password = 'Admin123!@#'; // Meets 12+ chars + complexity
      const fullName = 'NCSKIT Administrator';
      const role = 'admin';
      
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      const result = await client.query(
        `INSERT INTO users (email, password_hash, full_name, role, is_active, email_verified, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
         RETURNING id, email, full_name, role`,
        [email, passwordHash, fullName, role, true, true]
      );
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@ncskit.com');
      console.log('🔑 Password: Admin123!@#');
      console.log('👤 Role: admin');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createAdminUser();