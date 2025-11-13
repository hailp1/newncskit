import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('API Endpoints Integration Tests', () => {
  let testUserId: string
  let testProjectId: string
  let testDatasetId: string

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'integration-test@example.com',
        name: 'Integration Test User',
        password: 'hashed-password',
      },
    })
    testUserId = user.id
  })

  afterAll(async () => {
    // Cleanup test data
    if (testDatasetId) {
      await prisma.dataset.deleteMany({ where: { id: testDatasetId } })
    }
    if (testProjectId) {
      await prisma.project.deleteMany({ where: { id: testProjectId } })
    }
    if (testUserId) {
      await prisma.user.deleteMany({ where: { id: testUserId } })
    }
    await prisma.$disconnect()
  })

  describe('Projects API', () => {
    it('should create a project', async () => {
      const project = await prisma.project.create({
        data: {
          name: 'Test Project',
          description: 'Test Description',
          userId: testUserId,
        },
      })

      expect(project).toBeDefined()
      expect(project.name).toBe('Test Project')
      expect(project.userId).toBe(testUserId)
      testProjectId = project.id
    })

    it('should list user projects', async () => {
      const projects = await prisma.project.findMany({
        where: { userId: testUserId },
      })

      expect(projects).toBeDefined()
      expect(projects.length).toBeGreaterThan(0)
      expect(projects[0].userId).toBe(testUserId)
    })

    it('should get project by id', async () => {
      const project = await prisma.project.findUnique({
        where: { id: testProjectId },
        include: { datasets: true },
      })

      expect(project).toBeDefined()
      expect(project?.id).toBe(testProjectId)
    })

    it('should update project', async () => {
      const updated = await prisma.project.update({
        where: { id: testProjectId },
        data: { name: 'Updated Project Name' },
      })

      expect(updated.name).toBe('Updated Project Name')
    })
  })

  describe('Datasets API', () => {
    it('should create a dataset', async () => {
      const dataset = await prisma.dataset.create({
        data: {
          name: 'Test Dataset',
          fileName: 'test.csv',
          filePath: '/uploads/test.csv',
          fileSize: 1024,
          projectId: testProjectId,
        },
      })

      expect(dataset).toBeDefined()
      expect(dataset.name).toBe('Test Dataset')
      expect(dataset.projectId).toBe(testProjectId)
      testDatasetId = dataset.id
    })

    it('should list datasets for project', async () => {
      const datasets = await prisma.dataset.findMany({
        where: { projectId: testProjectId },
      })

      expect(datasets).toBeDefined()
      expect(datasets.length).toBeGreaterThan(0)
    })

    it('should get dataset by id', async () => {
      const dataset = await prisma.dataset.findUnique({
        where: { id: testDatasetId },
      })

      expect(dataset).toBeDefined()
      expect(dataset?.id).toBe(testDatasetId)
    })
  })

  describe('Analysis API', () => {
    it('should create analysis record', async () => {
      const analysis = await prisma.analysis.create({
        data: {
          type: 'sentiment',
          parameters: { threshold: 0.5 },
          results: {},
          status: 'pending',
          datasetId: testDatasetId,
        },
      })

      expect(analysis).toBeDefined()
      expect(analysis.type).toBe('sentiment')
      expect(analysis.status).toBe('pending')

      // Cleanup
      await prisma.analysis.delete({ where: { id: analysis.id } })
    })

    it('should update analysis status', async () => {
      const analysis = await prisma.analysis.create({
        data: {
          type: 'cluster',
          parameters: {},
          results: {},
          status: 'running',
          datasetId: testDatasetId,
        },
      })

      const updated = await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          status: 'completed',
          results: { clusters: 3 },
          completedAt: new Date(),
        },
      })

      expect(updated.status).toBe('completed')
      expect(updated.completedAt).toBeDefined()

      // Cleanup
      await prisma.analysis.delete({ where: { id: analysis.id } })
    })
  })
})
