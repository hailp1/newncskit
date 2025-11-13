require('dotenv').config({path:'.env.local'})
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding blog categories...')

  const categories = [
    {
      name: 'Công nghệ',
      slug: 'cong-nghe',
      description: 'Tin tức và bài viết về công nghệ',
      color: '#3B82F6',
      icon: '💻'
    },
    {
      name: 'Khoa học',
      slug: 'khoa-hoc',
      description: 'Nghiên cứu và phát hiện khoa học',
      color: '#10B981',
      icon: '🔬'
    },
    {
      name: 'Giáo dục',
      slug: 'giao-duc',
      description: 'Phương pháp và xu hướng giáo dục',
      color: '#F59E0B',
      icon: '📚'
    },
    {
      name: 'Y tế',
      slug: 'y-te',
      description: 'Sức khỏe và y học',
      color: '#EF4444',
      icon: '⚕️'
    },
    {
      name: 'Kinh doanh',
      slug: 'kinh-doanh',
      description: 'Tin tức kinh doanh và khởi nghiệp',
      color: '#8B5CF6',
      icon: '💼'
    }
  ]

  for (const category of categories) {
    const created = await prisma.blogCategory.create({
      data: category
    })
    console.log(`Created category: ${created.name}`)
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
