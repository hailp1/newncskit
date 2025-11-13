const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixAdminRole() {
  try {
    console.log('🔧 Fixing admin role...\n')
    
    // Update admin role
    const updated = await prisma.user.update({
      where: { email: 'phuchai.le@gmail.com' },
      data: {
        role: 'admin',
        status: 'active',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
      }
    })

    console.log('✅ Admin role updated successfully!')
    console.log('-----------------------------------')
    console.log('Email:', updated.email)
    console.log('Name:', updated.fullName)
    console.log('Role:', updated.role)
    console.log('Status:', updated.status)
    console.log('-----------------------------------\n')
    console.log('✅ Now login with this account to see admin panel in header')

  } catch (error) {
    if (error.code === 'P2025') {
      console.log('❌ Admin account not found!')
      console.log('Run: node scripts/create-admin.js first')
    } else {
      console.error('❌ Error:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

fixAdminRole()
