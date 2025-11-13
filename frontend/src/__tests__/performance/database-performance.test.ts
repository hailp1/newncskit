import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('Database Performance Tests', () => {
  let testUserId: string
  let testProjectIds: string[] = []

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'perf-test@example.com',
        name: 'Performance Test User',
        password: 'hashed-password',
      },
    })
    testUserId = user.id
  })

  afterAll(async () => {
    // Cleanup
    if (testProjectIds.length > 0) {
      await prisma.project.deleteMany({
        where: { id: { in: testProjectIds } },
      })
    }
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } })
    }
    await prisma.$disconnect()
  })

  describe('Query Performance', () => {
    it('should fetch user projects efficiently', async () => {
      // Create test projects
      const projects = await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          prisma.project.create({
            data: {
              name: `Performance Test Project ${i}`,
              userId: testUserId,
            },
          })
        )
      )
      testProjectIds = projects.map((p) => p.id)

      // Measure query time
      const startTime = performance.now()
      const fetchedProjects = await prisma.project.findMany({
        where: { userId: testUserId },
        include: { datasets: true },
        orderBy: { createdAt: 'desc' },
      })
      const endTime = performance.now()
      const queryTime = endTime - startTime

      expect(fetchedProjects.length).toBe(10)
      expect(queryTime).toBeLessThan(100) // Should complete in less than 100ms
    })

    it('should handle pagination efficiently', async () => {
      const pageSize = 5
      const startTime = performance.now()

      const page1 = await prisma.project.findMany({
        where: { userId: testUserId },
        take: pageSize,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      })

      const page2 = await prisma.project.findMany({
        where: { userId: testUserId },
        take: pageSize,
        skip: pageSize,
        orderBy: { createdAt: 'desc' },
      })

      const endTime = performance.now()
      const queryTime = endTime - startTime

      expect(page1.length).toBe(5)
      expect(page2.length).toBe(5)
      expect(queryTime).toBeLessThan(150) // Both queries should complete in less than 150ms
    })

    it('should perform complex joins efficiently', async () => {
      // Create project with datasets and analyses
      const project = await prisma.project.create({
        data: {
          name: 'Complex Query Test',
          userId: testUserId,
          datasets: {
            create: [
              {
                name: 'Dataset 1',
                fileName: 'test1.csv',
                filePath: '/uploads/test1.csv',
                fileSize: 1024,
                analyses: {
                  create: [
                    {
                      type: 'sentiment',
                      parameters: {},
                      results: {},
                      status: 'completed',
                    },
                  ],
                },
              },
            ],
          },
        },
      })
      testProjectIds.push(project.id)

      // Measure complex query time
      const startTime = performance.now()
      const result = await prisma.project.findUnique({
        where: { id: project.id },
        include: {
          datasets: {
            include: {
              analyses: true,
            },
          },
        },
      })
      const endTime = performance.now()
      const queryTime = endTime - startTime

      expect(result).toBeDefined()
      expect(result?.datasets.length).toBe(1)
      expect(result?.datasets[0].analyses.length).toBe(1)
      expect(queryTime).toBeLessThan(100) // Complex query should complete in less than 100ms
    })
  })

  describe('Bulk Operations Performance', () => {
    it('should handle bulk inserts efficiently', async () => {
      const project = await prisma.project.create({
        data: {
          name: 'Bulk Insert Test',
          userId: testUserId,
        },
      })
      testProjectIds.push(project.id)

      const startTime = performance.now()

      // Bulk create datasets
      await prisma.dataset.createMany({
        data: Array.from({ length: 50 }, (_, i) => ({
          name: `Bulk Dataset ${i}`,
          fileName: `bulk-${i}.csv`,
          filePath: `/uploads/bulk-${i}.csv`,
          fileSize: 1024 * (i + 1),
          projectId: project.id,
        })),
      })

      const endTime = performance.now()
      const insertTime = endTime - startTime

      const count = await prisma.dataset.count({
        where: { projectId: project.id },
      })

      expect(count).toBe(50)
      expect(insertTime).toBeLessThan(500) // Bulk insert should complete in less than 500ms
    })

    it('should handle bulk updates efficiently', async () => {
      const project = testProjectIds[testProjectIds.length - 1]

      const startTime = performance.now()

      await prisma.dataset.updateMany({
        where: { projectId: project },
        data: { rowCount: 100 },
      })

      const endTime = performance.now()
      const updateTime = endTime - startTime

      expect(updateTime).toBeLessThan(300) // Bulk update should complete in less than 300ms
    })
  })

  describe('Connection Pool Performance', () => {
    it('should handle concurrent queries efficiently', async () => {
      const startTime = performance.now()

      // Execute 10 concurrent queries
      const results = await Promise.all(
        Array.from({ length: 10 }, () =>
          prisma.project.findMany({
            where: { userId: testUserId },
            take: 5,
          })
        )
      )

      const endTime = performance.now()
      const totalTime = endTime - startTime

      expect(results.length).toBe(10)
      expect(totalTime).toBeLessThan(500) // 10 concurrent queries should complete in less than 500ms
    })
  })
})
