const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAdmin() {
  try {
    console.log('🔍 Checking admin account...\n')
    
    const adminUser = await prisma.user.findUnique({
      where: { email: 'phuchai.le@gmail.com' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true,
      }
    })

    if (!adminUser) {
      console.log('❌ Admin account not found!')
      console.log('Run: node scripts/create-admin.js')
      return
    }

    console.log('✅ Admin account found:')
    console.log('-----------------------------------')
    console.log('ID:', adminUser.id)
    console.log('Email:', adminUser.email)
    console.log('Name:', adminUser.fullName)
    console.log('Role:', adminUser.role)
    console.log('Status:', adminUser.status)
    console.log('Created:', adminUser.createdAt)
    console.log('-----------------------------------\n')

    if (adminUser.role === 'admin') {
      console.log('✅ Role is correct: admin')
    } else {
      console.log('❌ Role is NOT admin:', adminUser.role)
      console.log('Need to update role to "admin"')
    }

    if (adminUser.status === 'active') {
      console.log('✅ Status is active')
    } else {
      console.log('⚠️  Status is:', adminUser.status)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()
