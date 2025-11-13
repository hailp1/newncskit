import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

describe('Complete User Flows Integration', () => {
  let testUser: any
  let testProject: any
  let testDataset: any

  beforeAll(async () => {
    // Setup test user
    const hashedPassword = await bcrypt.hash('testpassword123', 10)
    testUser = await prisma.user.create({
      data: {
        email: 'userflow-test@example.com',
        name: 'User Flow Test',
        password: hashedPassword,
      },
    })
  })

  afterAll(async () => {
    // Cleanup in reverse order
    if (testDataset) {
      await prisma.analysis.deleteMany({ where: { datasetId: testDataset.id } })
      await prisma.dataset.deleteMany({ where: { id: testDataset.id } })
    }
    if (testProject) {
      await prisma.project.deleteMany({ where: { id: testProject.id } })
    }
    if (testUser) {
      await prisma.session.deleteMany({ where: { userId: testUser.id } })
      await prisma.account.deleteMany({ where: { userId: testUser.id } })
      await prisma.user.deleteMany({ where: { id: testUser.id } })
    }
    await prisma.$disconnect()
  })

  describe('Flow 1: User Registration and Login', () => {
    it('should verify user was created', () => {
      expect(testUser).toBeDefined()
      expect(testUser.email).toBe('userflow-test@example.com')
      expect(testUser.password).toBeDefined()
    })

    it('should verify password is hashed', async () => {
      const isValid = await bcrypt.compare('testpassword123', testUser.password)
      expect(isValid).toBe(true)
    })
  })

  describe('Flow 2: Project Creation and Management', () => {
    it('should create a new project', async () => {
      testProject = await prisma.project.create({
        data: {
          name: 'Marketing Research Project',
          description: 'Customer feedback analysis',
          userId: testUser.id,
        },
      })

      expect(testProject).toBeDefined()
      expect(testProject.name).toBe('Marketing Research Project')
      expect(testProject.userId).toBe(testUser.id)
    })

    it('should list user projects', async () => {
      const projects = await prisma.project.findMany({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
      })

      expect(projects).toBeDefined()
      expect(projects.length).toBeGreaterThan(0)
      expect(projects[0].id).toBe(testProject.id)
    })

    it('should update project details', async () => {
      const updated = await prisma.project.update({
        where: { id: testProject.id },
        data: {
          name: 'Updated Marketing Research',
          description: 'Updated description',
        },
      })

      expect(updated.name).toBe('Updated Marketing Research')
      expect(updated.description).toBe('Updated description')
    })
  })

  describe('Flow 3: Dataset Upload and Storage', () => {
    it('should create dataset record', async () => {
      testDataset = await prisma.dataset.create({
        data: {
          name: 'Customer Feedback Q1 2024',
          fileName: 'feedback-q1-2024.csv',
          filePath: '/uploads/1234567890-feedback-q1-2024.csv',
          fileSize: 2048,
          rowCount: 100,
          columnCount: 5,
          projectId: testProject.id,
        },
      })

      expect(testDataset).toBeDefined()
      expect(testDataset.name).toBe('Customer Feedback Q1 2024')
      expect(testDataset.projectId).toBe(testProject.id)
    })

    it('should list datasets for project', async () => {
      const datasets = await prisma.dataset.findMany({
        where: { projectId: testProject.id },
        orderBy: { createdAt: 'desc' },
      })

      expect(datasets).toBeDefined()
      expect(datasets.length).toBeGreaterThan(0)
      expect(datasets[0].id).toBe(testDataset.id)
    })
  })

  describe('Flow 4: Analytics Execution', () => {
    it('should create analysis request', async () => {
      const analysis = await prisma.analysis.create({
        data: {
          type: 'sentiment',
          parameters: { language: 'vi', threshold: 0.5 },
          results: {},
          status: 'pending',
          datasetId: testDataset.id,
        },
      })

      expect(analysis).toBeDefined()
      expect(analysis.type).toBe('sentiment')
      expect(analysis.status).toBe('pending')
      expect(analysis.datasetId).toBe(testDataset.id)

      // Simulate analysis completion
      const completed = await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          status: 'completed',
          results: {
            sentiment_scores: [0.8, 0.6, -0.2, 0.4],
            average_sentiment: 0.4,
            positive_count: 3,
            negative_count: 1,
          },
          completedAt: new Date(),
        },
      })

      expect(completed.status).toBe('completed')
      expect(completed.completedAt).toBeDefined()
      expect(completed.results).toHaveProperty('sentiment_scores')

      // Cleanup
      await prisma.analysis.delete({ where: { id: analysis.id } })
    })

    it('should check for cached analysis results', async () => {
      // Create completed analysis
      const analysis1 = await prisma.analysis.create({
        data: {
          type: 'cluster',
          parameters: { n_clusters: 3 },
          results: { clusters: [1, 1, 2, 2, 3] },
          status: 'completed',
          datasetId: testDataset.id,
          completedAt: new Date(),
        },
      })

      // Check for existing analysis
      const cached = await prisma.analysis.findFirst({
        where: {
          datasetId: testDataset.id,
          type: 'cluster',
          status: 'completed',
        },
        orderBy: { createdAt: 'desc' },
      })

      expect(cached).toBeDefined()
      expect(cached?.id).toBe(analysis1.id)
      expect(cached?.results).toHaveProperty('clusters')

      // Cleanup
      await prisma.analysis.delete({ where: { id: analysis1.id } })
    })

    it('should handle failed analysis', async () => {
      const analysis = await prisma.analysis.create({
        data: {
          type: 'topics',
          parameters: { n_topics: 5 },
          results: {},
          status: 'running',
          datasetId: testDataset.id,
        },
      })

      // Simulate failure
      const failed = await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          status: 'failed',
          results: { error: 'R service timeout' },
          completedAt: new Date(),
        },
      })

      expect(failed.status).toBe('failed')
      expect(failed.results).toHaveProperty('error')

      // Cleanup
      await prisma.analysis.delete({ where: { id: analysis.id } })
    })
  })

  describe('Flow 5: Project with Multiple Datasets', () => {
    it('should handle multiple datasets in one project', async () => {
      const dataset2 = await prisma.dataset.create({
        data: {
          name: 'Customer Feedback Q2 2024',
          fileName: 'feedback-q2-2024.csv',
          filePath: '/uploads/1234567891-feedback-q2-2024.csv',
          fileSize: 3072,
          projectId: testProject.id,
        },
      })

      const datasets = await prisma.dataset.findMany({
        where: { projectId: testProject.id },
      })

      expect(datasets.length).toBeGreaterThanOrEqual(2)

      // Cleanup
      await prisma.dataset.delete({ where: { id: dataset2.id } })
    })
  })

  describe('Flow 6: Cascade Deletion', () => {
    it('should verify cascade deletion works', async () => {
      // Create temporary project with dataset and analysis
      const tempProject = await prisma.project.create({
        data: {
          name: 'Temp Project',
          userId: testUser.id,
        },
      })

      const tempDataset = await prisma.dataset.create({
        data: {
          name: 'Temp Dataset',
          fileName: 'temp.csv',
          filePath: '/uploads/temp.csv',
          fileSize: 1024,
          projectId: tempProject.id,
        },
      })

      const tempAnalysis = await prisma.analysis.create({
        data: {
          type: 'sentiment',
          parameters: {},
          results: {},
          status: 'completed',
          datasetId: tempDataset.id,
        },
      })

      // Delete project (should cascade to datasets and analyses)
      await prisma.project.delete({ where: { id: tempProject.id } })

      // Verify cascade deletion
      const deletedDataset = await prisma.dataset.findUnique({
        where: { id: tempDataset.id },
      })
      const deletedAnalysis = await prisma.analysis.findUnique({
        where: { id: tempAnalysis.id },
      })

      expect(deletedDataset).toBeNull()
      expect(deletedAnalysis).toBeNull()
    })
  })
})
