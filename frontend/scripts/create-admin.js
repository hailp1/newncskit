#!/usr/bin/env node

/**
 * Create Super Admin User Script
 * 
 * This script creates a super admin user in the database.
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('🔐 Creating Super Admin User...\n');

  const email = 'phuchai.le@gmail.com';
  const password = 'Admin123';
  const name = 'Phuc Hai Le';

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('⚠️  User already exists!');
      console.log(`Email: ${email}`);
      console.log(`User ID: ${existingUser.id}`);
      console.log('\nTo reset password, delete the user first:');
      console.log(`npx prisma studio`);
      return;
    }

    // Hash password
    console.log('🔒 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    console.log('👤 Creating user...');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: name,
        firstName: 'Phuc Hai',
        lastName: 'Le',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        role: 'admin', // Set as admin
        status: 'active',
        subscriptionType: 'premium', // Give premium subscription
        tokenBalance: 10000, // Give lots of tokens
      },
    });

    console.log('\n✅ Super Admin User Created Successfully!\n');
    console.log('═'.repeat(50));
    console.log('User Details:');
    console.log('═'.repeat(50));
    console.log(`Email:     ${email}`);
    console.log(`Password:  ${password}`);
    console.log(`Name:      ${name}`);
    console.log(`User ID:   ${user.id}`);
    console.log(`Role:      ADMIN`);
    console.log(`Status:    Active`);
    console.log(`Verified:  Yes`);
    console.log('═'.repeat(50));
    console.log('\n🚀 You can now login at: http://localhost:3000/login\n');

  } catch (error) {
    console.error('\n❌ Error creating admin user:');
    console.error(error.message);
    
    if (error.code === 'P2002') {
      console.error('\nUser with this email already exists!');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
