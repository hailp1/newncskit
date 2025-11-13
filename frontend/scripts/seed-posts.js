require('dotenv').config({path:'.env.local'})
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding blog posts...')

  // Get first user as author
  const user = await prisma.user.findFirst()
  if (!user) {
    console.error('No users found. Please create a user first.')
    return
  }

  // Get categories
  const categories = await prisma.blogCategory.findMany()
  if (categories.length === 0) {
    console.error('No categories found. Please run seed-categories.js first.')
    return
  }

  const posts = [
    {
      title: 'Xu hướng AI trong năm 2025',
      slug: 'xu-huong-ai-trong-nam-2025',
      content: 'Trí tuệ nhân tạo đang phát triển với tốc độ chóng mặt. Trong năm 2025, chúng ta sẽ chứng kiến nhiều đột phá mới trong machine learning, deep learning và các ứng dụng AI thực tế.',
      status: 'published',
      authorId: user.id,
      categoryId: categories[0].id, // Công nghệ
      tags: ['AI', 'Machine Learning', 'Technology', 'Innovation'],
      publishedAt: new Date(),
      metaDescription: 'Tìm hiểu về xu hướng AI và machine learning trong năm 2025'
    },
    {
      title: 'Phát hiện mới về vật lý lượng tử',
      slug: 'phat-hien-moi-ve-vat-ly-luong-tu',
      content: 'Các nhà khoa học vừa công bố một phát hiện đột phá trong lĩnh vực vật lý lượng tử, mở ra cánh cửa cho công nghệ máy tính lượng tử thế hệ mới.',
      status: 'published',
      authorId: user.id,
      categoryId: categories[1].id, // Khoa học
      tags: ['Quantum Physics', 'Science', 'Research', 'Innovation'],
      publishedAt: new Date(),
      metaDescription: 'Phát hiện mới trong vật lý lượng tử và ứng dụng thực tế'
    },
    {
      title: 'Phương pháp học tập hiệu quả cho sinh viên',
      slug: 'phuong-phap-hoc-tap-hieu-qua',
      content: 'Học tập hiệu quả không chỉ là học nhiều mà còn là học đúng cách. Các phương pháp như Pomodoro, Active Recall và Spaced Repetition đã được khoa học chứng minh hiệu quả.',
      status: 'published',
      authorId: user.id,
      categoryId: categories[2].id, // Giáo dục
      tags: ['Education', 'Learning', 'Study Tips', 'Students'],
      publishedAt: new Date(),
      metaDescription: 'Phương pháp học tập hiệu quả dựa trên nghiên cứu khoa học'
    },
    {
      title: 'Chăm sóc sức khỏe tinh thần trong thời đại số',
      slug: 'cham-soc-suc-khoe-tinh-than',
      content: 'Sức khỏe tinh thần ngày càng trở nên quan trọng trong cuộc sống hiện đại. Hướng dẫn cách cân bằng giữa công việc và cuộc sống trong môi trường số hóa.',
      status: 'published',
      authorId: user.id,
      categoryId: categories[3].id, // Y tế
      tags: ['Mental Health', 'Healthcare', 'Wellness', 'Digital Age'],
      publishedAt: new Date(),
      metaDescription: 'Cách chăm sóc sức khỏe tinh thần trong thời đại công nghệ số'
    },
    {
      title: 'Khởi nghiệp thành công: Bí quyết từ các CEO',
      slug: 'khoi-nghiep-thanh-cong',
      content: 'Khởi nghiệp không dễ dàng, nhưng với những bí quyết đúng đắn từ các CEO thành công, bạn có thể tăng cơ hội thành công cho startup của mình.',
      status: 'published',
      authorId: user.id,
      categoryId: categories[4].id, // Kinh doanh
      tags: ['Startup', 'Business', 'Entrepreneurship', 'Success'],
      publishedAt: new Date(),
      metaDescription: 'Bí quyết khởi nghiệp thành công từ các CEO hàng đầu'
    }
  ]

  for (const post of posts) {
    const created = await prisma.post.create({
      data: post
    })
    console.log(`Created post: ${created.title}`)
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
