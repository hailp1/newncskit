import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPaperCategory() {
  try {
    console.log('Checking for "paper" category...');
    
    // Check if paper category exists
    const paperCategory = await prisma.blogCategory.findFirst({
      where: {
        OR: [
          { name: { equals: 'paper', mode: 'insensitive' } },
          { slug: { equals: 'paper', mode: 'insensitive' } }
        ]
      }
    });

    if (paperCategory) {
      console.log('✅ Paper category found:');
      console.log(`   ID: ${paperCategory.id}`);
      console.log(`   Name: ${paperCategory.name}`);
      console.log(`   Slug: ${paperCategory.slug}`);
      
      // Count posts in this category
      const postCount = await prisma.post.count({
        where: {
          categoryId: paperCategory.id,
          status: 'published'
        }
      });
      
      console.log(`   Published posts: ${postCount}`);
    } else {
      console.log('❌ Paper category not found!');
      console.log('Creating paper category...');
      
      const newCategory = await prisma.blogCategory.create({
        data: {
          name: 'Paper',
          slug: 'paper',
          description: 'Research papers and academic publications',
          color: '#3B82F6',
          icon: 'file-text'
        }
      });
      
      console.log('✅ Paper category created:');
      console.log(`   ID: ${newCategory.id}`);
      console.log(`   Name: ${newCategory.name}`);
      console.log(`   Slug: ${newCategory.slug}`);
    }
    
    // List all categories
    const allCategories = await prisma.blogCategory.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('\n📋 All categories:');
    allCategories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug}) [ID: ${cat.id}]`);
    });
    
  } catch (error) {
    console.error('Error checking paper category:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPaperCategory();

