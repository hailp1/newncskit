const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function forceUpdateAdmin() {
  try {
    console.log('🔧 Force updating admin role...\n')
    
    const email = 'phuchai.le@gmail.com'
    
    // Update user to admin
    const updated = await prisma.user.update({
      where: { email },
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

    console.log('✅ Successfully updated!')
    console.log('-----------------------------------')
    console.log('Email:', updated.email)
    console.log('Name:', updated.fullName)
    console.log('Role:', updated.role)
    console.log('Status:', updated.status)
    console.log('-----------------------------------\n')
    console.log('🎉 Now logout and login again!')
    console.log('   URL: http://localhost:3000/login')
    console.log('   Email: phuchai.le@gmail.com')
    console.log('   Password: Admin123')

  } catch (error) {
    console.error('❌ Error:', error.message)
    
    if (error.code === 'P2025') {
      console.log('\n⚠️  User not found!')
      console.log('Run: node scripts/create-admin.js')
    }
  } finally {
    await prisma.$disconnect()
  }
}

forceUpdateAdmin()
