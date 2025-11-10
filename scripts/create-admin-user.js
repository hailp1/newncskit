/**
 * Script to create admin user in Supabase
 * Run: node scripts/create-admin-user.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('🚀 Creating admin user...\n');

  const adminEmail = 'admin@ncskit.org';
  const adminPassword = 'Admin@NCSKIT2024'; // Change this to a secure password

  try {
    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }

    const existingUser = existingUsers.users.find(u => u.email === adminEmail);

    if (existingUser) {
      console.log('✓ Admin user already exists');
      console.log('  ID:', existingUser.id);
      console.log('  Email:', existingUser.email);
      console.log('  Created:', existingUser.created_at);
      
      // Update user profile to admin role
      const { error: updateError } = await supabase
        .from('users')
        .upsert({
          id: existingUser.id,
          email: adminEmail,
          role: 'admin',
          full_name: 'System Administrator',
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error('⚠️  Warning: Could not update user profile:', updateError.message);
      } else {
        console.log('✓ Admin role updated in users table');
      }

      console.log('\n📧 Login credentials:');
      console.log('   Email:', adminEmail);
      console.log('   Password: (use your existing password)');
      return;
    }

    // Create new admin user
    console.log('Creating new admin user...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'System Administrator',
        role: 'admin'
      }
    });

    if (createError) {
      throw createError;
    }

    console.log('✓ Admin user created successfully!');
    console.log('  ID:', newUser.user.id);
    console.log('  Email:', newUser.user.email);

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: newUser.user.id,
        email: adminEmail,
        role: 'admin',
        full_name: 'System Administrator',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('⚠️  Warning: Could not create user profile:', profileError.message);
    } else {
      console.log('✓ User profile created');
    }

    console.log('\n📧 Login credentials:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdminUser();
