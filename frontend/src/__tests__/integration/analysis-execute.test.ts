import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { POST } from '@/app/api/analysis/execute/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/services/r-analysis', () => ({
  rAnalysisService: {
    descriptiveAnalysis: vi.fn(),
    reliabilityAnalysis: vi.fn(),
    exploratoryFactorAnalysis: vi.fn(),
    confirmatoryFactorAnalysis: vi.fn(),
    structuralEquationModeling: vi.fn(),
    vifAnalysis: vi.fn(),
    anovaAnalysis: vi.fn(),
    ttestAnalysis: vi.fn(),
  },
}));

describe('Analysis Execute API - Authentication and Authorization', () => {
  let testUser1Id: string;
  let testUser2Id: string;
  let testProjectId: string;
  let testCsvPath: string;

  beforeAll(async () => {
    // Create test users
    const user1 = await prisma.user.create({
      data: {
        email: 'execute-test-user1@example.com',
        name: 'Execute Test User 1',
        password: 'hashed-password',
      },
    });
    testUser1Id = user1.id;

    const user2 = await prisma.user.create({
      data: {
        email: 'execute-test-user2@example.com',
        name: 'Execute Test User 2',
        password: 'hashed-password',
      },
    });
    testUser2Id = user2.id;

    // Create test CSV file
    const uploadsDir = join(process.cwd(), 'uploads', 'csv', 'test');
    await mkdir(uploadsDir, { recursive: true });
    
    testCsvPath = join('uploads', 'csv', 'test', 'execute-test.csv');
    const fullCsvPath = join(process.cwd(), testCsvPath);
    
    const csvContent = `age,gender,score1,score2
25,M,4,5
30,F,3,4
35,M,5,5
28,F,4,3`;
    
    await writeFile(fullCsvPath, csvContent);

    // Create test project with variables
    const project = await prisma.analysisProject.create({
      data: {
        name: 'Execute Test Project',
        description: 'Test project for execute endpoint',
        userId: testUser1Id,
        csvFileName: 'execute-test.csv',
        csvFilePath: testCsvPath,
        csvFileSize: csvContent.length,
        status: 'completed',
      },
    });
    testProjectId = project.id;

    // Create test variables
    await prisma.analysisVariable.createMany({
      data: [
        {
          projectId: testProjectId,
          columnName: 'age',
          displayName: 'Age',
          dataType: 'numeric',
          isDemographic: true,
          demographicType: 'age',
        },
        {
          projectId: testProjectId,
          columnName: 'gender',
          displayName: 'Gender',
          dataType: 'categorical',
          isDemographic: true,
          demographicType: 'gender',
        },
        {
          projectId: testProjectId,
          columnName: 'score1',
          displayName: 'Score 1',
          dataType: 'numeric',
          isDemographic: false,
        },
        {
          projectId: testProjectId,
          columnName: 'score2',
          displayName: 'Score 2',
          dataType: 'numeric',
          isDemographic: false,
        },
      ],
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.analysisResult.deleteMany({ where: { projectId: testProjectId } });
    await prisma.analysisVariable.deleteMany({ where: { projectId: testProjectId } });
    await prisma.analysisProject.deleteMany({ where: { id: testProjectId } });
    await prisma.user.deleteMany({ where: { id: { in: [testUser1Id, testUser2Id] } } });
    
    // Cleanup test files
    const testDir = join(process.cwd(), 'uploads', 'csv', 'test');
    await rm(testDir, { recursive: true, force: true });
    
    await prisma.$disconnect();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    // Mock no session
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({ projectId: testProjectId }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Unauthorized');
    expect(data.correlationId).toBeDefined();
  });

  it('should return 403 when accessing another user\'s project', async () => {
    // Mock session for user2 trying to access user1's project
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: testUser2Id, email: 'execute-test-user2@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    });

    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({ projectId: testProjectId }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toBe('You do not have permission to access this project');
    expect(data.correlationId).toBeDefined();
  });

  it('should succeed with valid authentication and ownership', async () => {
    // Mock session for user1 (project owner)
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: testUser1Id, email: 'execute-test-user1@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    });

    // Mock R service response
    const { rAnalysisService } = await import('@/services/r-analysis');
    vi.mocked(rAnalysisService.descriptiveAnalysis).mockResolvedValue({
      summary: { mean: 4.0, sd: 0.8 },
    });

    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({ projectId: testProjectId }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.analysisId).toBeDefined();
    expect(data.data.projectId).toBe(testProjectId);
    expect(data.data.results).toBeDefined();
    expect(data.correlationId).toBeDefined();
  });
});

describe('Analysis Execute API - Data Retrieval and Validation', () => {
  let testUserId: string;
  let testProjectWithoutVariablesId: string;
  let testCsvPath: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'execute-validation-test@example.com',
        name: 'Execute Validation Test User',
        password: 'hashed-password',
      },
    });
    testUserId = user.id;

    // Create test CSV file
    const uploadsDir = join(process.cwd(), 'uploads', 'csv', 'test');
    await mkdir(uploadsDir, { recursive: true });
    
    testCsvPath = join('uploads', 'csv', 'test', 'validation-test.csv');
    const fullCsvPath = join(process.cwd(), testCsvPath);
    
    const csvContent = `score1,score2
4,5
3,4`;
    
    await writeFile(fullCsvPath, csvContent);

    // Create project without variables
    const projectWithoutVars = await prisma.analysisProject.create({
      data: {
        name: 'Project Without Variables',
        description: 'Test project without variables',
        userId: testUserId,
        csvFileName: 'validation-test.csv',
        csvFilePath: testCsvPath,
        csvFileSize: csvContent.length,
        status: 'completed',
      },
    });
    testProjectWithoutVariablesId = projectWithoutVars.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.analysisProject.deleteMany({ where: { id: testProjectWithoutVariablesId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    
    await prisma.$disconnect();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 404 with invalid project ID', async () => {
    // Mock authenticated session
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: testUserId, email: 'execute-validation-test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    });

    const invalidProjectId = '00000000-0000-0000-0000-000000000000';
    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({ projectId: invalidProjectId }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Project not found');
    expect(data.correlationId).toBeDefined();
  });

  it('should return 404 when project has no variables', async () => {
    // Mock authenticated session
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: testUserId, email: 'execute-validation-test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    });

    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({ projectId: testProjectWithoutVariablesId }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('No variables found for this project');
    expect(data.correlationId).toBeDefined();
  });

  it('should return 400 when projectId is missing', async () => {
    // Mock authenticated session
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: testUserId, email: 'execute-validation-test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    });

    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Project ID is required');
    expect(data.correlationId).toBeDefined();
  });
});

describe('Analysis Execute API - Analysis Execution', () => {
  let testUserId: string;
  let testProjectId: string;
  let testGroupId: string;
  let testCsvPath: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'execute-analysis-test@example.com',
        name: 'Execute Analysis Test User',
        password: 'hashed-password',
      },
    });
    testUserId = user.id;

    // Create test CSV file with more data
    const uploadsDir = join(process.cwd(), 'uploads', 'csv', 'test');
    await mkdir(uploadsDir, { recursive: true });
    
    testCsvPath = join('uploads', 'csv', 'test', 'analysis-test.csv');
    const fullCsvPath = join(process.cwd(), testCsvPath);
    
    const csvContent = `age,gender,item1,item2,item3,item4
25,M,4,5,4,5
30,F,3,4,3,4
35,M,5,5,5,5
28,F,4,3,4,3
32,M,5,4,5,4
27,F,3,5,3,5`;
    
    await writeFile(fullCsvPath, csvContent);

    // Create test project
    const project = await prisma.analysisProject.create({
      data: {
        name: 'Analysis Execution Test Project',
        description: 'Test project for analysis execution',
        userId: testUserId,
        csvFileName: 'analysis-test.csv',
        csvFilePath: testCsvPath,
        csvFileSize: csvContent.length,
        status: 'completed',
      },
    });
    testProjectId = project.id;

    // Create variable group
    const group = await prisma.variableGroup.create({
      data: {
        projectId: testProjectId,
        name: 'Test Scale',
        description: 'Test scale for reliability analysis',
      },
    });
    testGroupId = group.id;

    // Create test variables
    await prisma.analysisVariable.createMany({
      data: [
        {
          projectId: testProjectId,
          columnName: 'age',
          displayName: 'Age',
          dataType: 'numeric',
          isDemographic: true,
          demographicType: 'age',
        },
        {
          projectId: testProjectId,
          columnName: 'gender',
          displayName: 'Gender',
          dataType: 'categorical',
          isDemographic: true,
          demographicType: 'gender',
        },
        {
          projectId: testProjectId,
          columnName: 'item1',
          displayName: 'Item 1',
          dataType: 'numeric',
          isDemographic: false,
          groupId: testGroupId,
        },
        {
          projectId: testProjectId,
          columnName: 'item2',
          displayName: 'Item 2',
          dataType: 'numeric',
          isDemographic: false,
          groupId: testGroupId,
        },
        {
          projectId: testProjectId,
          columnName: 'item3',
          displayName: 'Item 3',
          dataType: 'numeric',
          isDemographic: false,
          groupId: testGroupId,
        },
        {
          projectId: testProjectId,
          columnName: 'item4',
          displayName: 'Item 4',
          dataType: 'numeric',
          isDemographic: false,
          groupId: testGroupId,
        },
      ],
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.analysisResult.deleteMany({ where: { projectId: testProjectId } });
    await prisma.analysisVariable.deleteMany({ where: { projectId: testProjectId } });
    await prisma.variableGroup.deleteMany({ where: { id: testGroupId } });
    await prisma.analysisProject.deleteMany({ where: { id: testProjectId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    
    await prisma.$disconnect();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock authenticated session for all tests
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: testUserId, email: 'execute-analysis-test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    });
  });

  it('should execute descriptive analysis with valid data', async () => {
    // Mock R service response
    const { rAnalysisService } = await import('@/services/r-analysis');
    const mockResults = {
      summary: {
        item1: { mean: 4.0, sd: 0.8, min: 3, max: 5 },
        item2: { mean: 4.3, sd: 0.8, min: 3, max: 5 },
      },
    };
    vi.mocked(rAnalysisService.descriptiveAnalysis).mockResolvedValue(mockResults);

    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({
        projectId: testProjectId,
        analysisType: 'descriptive',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.analysisId).toBeDefined();
    expect(data.data.projectId).toBe(testProjectId);
    expect(data.data.results).toEqual(mockResults);
    expect(data.data.executedAt).toBeDefined();
    expect(rAnalysisService.descriptiveAnalysis).toHaveBeenCalled();
  });

  it('should execute reliability analysis with variable groups', async () => {
    // Mock R service response
    const { rAnalysisService } = await import('@/services/r-analysis');
    const mockResults = {
      'Test Scale': {
        alpha: 0.85,
        items: 4,
        itemStatistics: [
          { item: 'item1', alphaIfDeleted: 0.82 },
          { item: 'item2', alphaIfDeleted: 0.83 },
        ],
      },
    };
    vi.mocked(rAnalysisService.reliabilityAnalysis).mockResolvedValue(mockResults);

    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({
        projectId: testProjectId,
        analysisType: 'reliability',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.results).toEqual(mockResults);
    expect(rAnalysisService.reliabilityAnalysis).toHaveBeenCalled();
  });

  it('should execute EFA with sufficient numeric variables', async () => {
    // Mock R service response
    const { rAnalysisService } = await import('@/services/r-analysis');
    const mockResults = {
      factors: 2,
      loadings: {
        item1: [0.8, 0.2],
        item2: [0.7, 0.3],
      },
      variance: { factor1: 45.2, factor2: 23.1 },
    };
    vi.mocked(rAnalysisService.exploratoryFactorAnalysis).mockResolvedValue(mockResults);

    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({
        projectId: testProjectId,
        analysisType: 'efa',
        config: { nFactors: 2 },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.results).toEqual(mockResults);
    expect(rAnalysisService.exploratoryFactorAnalysis).toHaveBeenCalled();
  });

  it('should execute CFA with model syntax', async () => {
    // Mock R service response
    const { rAnalysisService } = await import('@/services/r-analysis');
    const mockResults = {
      fit: { cfi: 0.95, tli: 0.93, rmsea: 0.06 },
      parameters: [
        { from: 'Factor1', to: 'item1', estimate: 0.8 },
      ],
    };
    vi.mocked(rAnalysisService.confirmatoryFactorAnalysis).mockResolvedValue(mockResults);

    const modelSyntax = 'Factor1 =~ item1 + item2 + item3 + item4';
    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({
        projectId: testProjectId,
        analysisType: 'cfa',
        config: { modelSyntax },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.results).toEqual(mockResults);
    expect(rAnalysisService.confirmatoryFactorAnalysis).toHaveBeenCalledWith(
      expect.any(Array),
      modelSyntax
    );
  });

  it('should return 400 for reliability analysis without groups', async () => {
    // Create a project without groups
    const projectWithoutGroups = await prisma.analysisProject.create({
      data: {
        name: 'Project Without Groups',
        userId: testUserId,
        csvFileName: 'test.csv',
        csvFilePath: testCsvPath,
        csvFileSize: 100,
        status: 'completed',
      },
    });

    await prisma.analysisVariable.create({
      data: {
        projectId: projectWithoutGroups.id,
        columnName: 'item1',
        displayName: 'Item 1',
        dataType: 'numeric',
        isDemographic: false,
      },
    });

    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({
        projectId: projectWithoutGroups.id,
        analysisType: 'reliability',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('requires at least one variable group');

    // Cleanup
    await prisma.analysisVariable.deleteMany({ where: { projectId: projectWithoutGroups.id } });
    await prisma.analysisProject.delete({ where: { id: projectWithoutGroups.id } });
  });

  it('should return 400 for EFA with insufficient variables', async () => {
    // Create a project with only 2 numeric variables
    const projectWithFewVars = await prisma.analysisProject.create({
      data: {
        name: 'Project With Few Variables',
        userId: testUserId,
        csvFileName: 'test.csv',
        csvFilePath: testCsvPath,
        csvFileSize: 100,
        status: 'completed',
      },
    });

    await prisma.analysisVariable.createMany({
      data: [
        {
          projectId: projectWithFewVars.id,
          columnName: 'item1',
          displayName: 'Item 1',
          dataType: 'numeric',
          isDemographic: false,
        },
        {
          projectId: projectWithFewVars.id,
          columnName: 'item2',
          displayName: 'Item 2',
          dataType: 'numeric',
          isDemographic: false,
        },
      ],
    });

    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({
        projectId: projectWithFewVars.id,
        analysisType: 'efa',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('requires at least 3 numeric variables');

    // Cleanup
    await prisma.analysisVariable.deleteMany({ where: { projectId: projectWithFewVars.id } });
    await prisma.analysisProject.delete({ where: { id: projectWithFewVars.id } });
  });
});

describe('Analysis Execute API - Result Storage', () => {
  let testUserId: string;
  let testProjectId: string;
  let testCsvPath: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'execute-storage-test@example.com',
        name: 'Execute Storage Test User',
        password: 'hashed-password',
      },
    });
    testUserId = user.id;

    // Create test CSV file
    const uploadsDir = join(process.cwd(), 'uploads', 'csv', 'test');
    await mkdir(uploadsDir, { recursive: true });
    
    testCsvPath = join('uploads', 'csv', 'test', 'storage-test.csv');
    const fullCsvPath = join(process.cwd(), testCsvPath);
    
    const csvContent = `score1,score2,score3
4,5,3
3,4,5
5,5,4`;
    
    await writeFile(fullCsvPath, csvContent);

    // Create test project
    const project = await prisma.analysisProject.create({
      data: {
        name: 'Storage Test Project',
        description: 'Test project for result storage',
        userId: testUserId,
        csvFileName: 'storage-test.csv',
        csvFilePath: testCsvPath,
        csvFileSize: csvContent.length,
        status: 'completed',
      },
    });
    testProjectId = project.id;

    // Create test variables
    await prisma.analysisVariable.createMany({
      data: [
        {
          projectId: testProjectId,
          columnName: 'score1',
          displayName: 'Score 1',
          dataType: 'numeric',
          isDemographic: false,
        },
        {
          projectId: testProjectId,
          columnName: 'score2',
          displayName: 'Score 2',
          dataType: 'numeric',
          isDemographic: false,
        },
        {
          projectId: testProjectId,
          columnName: 'score3',
          displayName: 'Score 3',
          dataType: 'numeric',
          isDemographic: false,
        },
      ],
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.analysisResult.deleteMany({ where: { projectId: testProjectId } });
    await prisma.analysisVariable.deleteMany({ where: { projectId: testProjectId } });
    await prisma.analysisProject.deleteMany({ where: { id: testProjectId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    
    // Cleanup result files
    const resultsDir = join(process.cwd(), 'uploads', 'results');
    await rm(resultsDir, { recursive: true, force: true });
    
    await prisma.$disconnect();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock authenticated session
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: testUserId, email: 'execute-storage-test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    });
  });

  it('should store small results in database', async () => {
    // Mock R service with small results
    const { rAnalysisService } = await import('@/services/r-analysis');
    const smallResults = {
      summary: { mean: 4.0, sd: 0.8 },
      count: 3,
    };
    vi.mocked(rAnalysisService.descriptiveAnalysis).mockResolvedValue(smallResults);

    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({
        projectId: testProjectId,
        analysisType: 'descriptive',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Verify database record
    const analysisResult = await prisma.analysisResult.findUnique({
      where: { id: data.data.analysisId },
    });

    expect(analysisResult).toBeDefined();
    expect(analysisResult?.projectId).toBe(testProjectId);
    expect(analysisResult?.analysisType).toBe('descriptive');
    expect(analysisResult?.results).toEqual(smallResults);
    expect(analysisResult?.resultsPath).toBeNull();
    expect(analysisResult?.status).toBe('completed');
    expect(analysisResult?.executionTime).toBeGreaterThan(0);
  });

  it('should store large results in file system', async () => {
    // Mock R service with large results (>100KB)
    const { rAnalysisService } = await import('@/services/r-analysis');
    
    // Create a large result object
    const largeResults = {
      summary: { mean: 4.0, sd: 0.8 },
      detailedData: Array(5000).fill(null).map((_, i) => ({
        id: i,
        value: Math.random(),
        description: `This is a detailed description for item ${i} with lots of text to make the result large`,
        metadata: {
          timestamp: new Date().toISOString(),
          additionalInfo: 'More data to increase size',
        },
      })),
    };
    
    vi.mocked(rAnalysisService.descriptiveAnalysis).mockResolvedValue(largeResults);

    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({
        projectId: testProjectId,
        analysisType: 'descriptive',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Verify database record
    const analysisResult = await prisma.analysisResult.findUnique({
      where: { id: data.data.analysisId },
    });

    expect(analysisResult).toBeDefined();
    expect(analysisResult?.projectId).toBe(testProjectId);
    expect(analysisResult?.analysisType).toBe('descriptive');
    expect(analysisResult?.results).toBeNull();
    expect(analysisResult?.resultsPath).toBeDefined();
    expect(analysisResult?.resultsPath).toContain('uploads/results/');
    expect(analysisResult?.status).toBe('completed');

    // Verify file exists
    const { readFile } = await import('fs/promises');
    const filePath = join(process.cwd(), analysisResult!.resultsPath!);
    const fileContent = await readFile(filePath, 'utf-8');
    const storedResults = JSON.parse(fileContent);
    
    expect(storedResults).toEqual(largeResults);
  });

  it('should create correct database records with all fields', async () => {
    // Mock R service
    const { rAnalysisService } = await import('@/services/r-analysis');
    const mockResults = { test: 'data' };
    vi.mocked(rAnalysisService.descriptiveAnalysis).mockResolvedValue(mockResults);

    const config = { option1: 'value1', option2: 'value2' };
    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({
        projectId: testProjectId,
        analysisType: 'descriptive',
        config,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);

    // Verify all fields in database
    const analysisResult = await prisma.analysisResult.findUnique({
      where: { id: data.data.analysisId },
    });

    expect(analysisResult).toBeDefined();
    expect(analysisResult?.id).toBe(data.data.analysisId);
    expect(analysisResult?.projectId).toBe(testProjectId);
    expect(analysisResult?.analysisType).toBe('descriptive');
    expect(analysisResult?.config).toEqual(config);
    expect(analysisResult?.status).toBe('completed');
    expect(analysisResult?.executedAt).toBeInstanceOf(Date);
    expect(analysisResult?.executionTime).toBeGreaterThan(0);
    expect(analysisResult?.createdAt).toBeInstanceOf(Date);
  });
});

describe('Analysis Execute API - Error Scenarios', () => {
  let testUserId: string;
  let testProjectId: string;
  let testProjectWithMissingCsvId: string;
  let testCsvPath: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'execute-error-test@example.com',
        name: 'Execute Error Test User',
        password: 'hashed-password',
      },
    });
    testUserId = user.id;

    // Create test CSV file
    const uploadsDir = join(process.cwd(), 'uploads', 'csv', 'test');
    await mkdir(uploadsDir, { recursive: true });
    
    testCsvPath = join('uploads', 'csv', 'test', 'error-test.csv');
    const fullCsvPath = join(process.cwd(), testCsvPath);
    
    const csvContent = `score1,score2
4,5
3,4`;
    
    await writeFile(fullCsvPath, csvContent);

    // Create test project with valid CSV
    const project = await prisma.analysisProject.create({
      data: {
        name: 'Error Test Project',
        description: 'Test project for error scenarios',
        userId: testUserId,
        csvFileName: 'error-test.csv',
        csvFilePath: testCsvPath,
        csvFileSize: csvContent.length,
        status: 'completed',
      },
    });
    testProjectId = project.id;

    await prisma.analysisVariable.createMany({
      data: [
        {
          projectId: testProjectId,
          columnName: 'score1',
          displayName: 'Score 1',
          dataType: 'numeric',
          isDemographic: false,
        },
        {
          projectId: testProjectId,
          columnName: 'score2',
          displayName: 'Score 2',
          dataType: 'numeric',
          isDemographic: false,
        },
      ],
    });

    // Create project with missing CSV file
    const projectWithMissingCsv = await prisma.analysisProject.create({
      data: {
        name: 'Project With Missing CSV',
        userId: testUserId,
        csvFileName: 'nonexistent.csv',
        csvFilePath: 'uploads/csv/test/nonexistent.csv',
        csvFileSize: 100,
        status: 'completed',
      },
    });
    testProjectWithMissingCsvId = projectWithMissingCsv.id;

    await prisma.analysisVariable.create({
      data: {
        projectId: testProjectWithMissingCsvId,
        columnName: 'score1',
        displayName: 'Score 1',
        dataType: 'numeric',
        isDemographic: false,
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.analysisResult.deleteMany({ where: { projectId: testProjectId } });
    await prisma.analysisVariable.deleteMany({ where: { projectId: { in: [testProjectId, testProjectWithMissingCsvId] } } });
    await prisma.analysisProject.deleteMany({ where: { id: { in: [testProjectId, testProjectWithMissingCsvId] } } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    
    await prisma.$disconnect();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock authenticated session
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: testUserId, email: 'execute-error-test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    });
  });

  it('should return 500 when R service is unavailable', async () => {
    // Mock R service to throw error
    const { rAnalysisService } = await import('@/services/r-analysis');
    vi.mocked(rAnalysisService.descriptiveAnalysis).mockRejectedValue(
      new Error('R service connection failed')
    );

    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({
        projectId: testProjectId,
        analysisType: 'descriptive',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Analysis failed');
    expect(data.error).toContain('R service connection failed');
    expect(data.correlationId).toBeDefined();
  });

  it('should return 500 when R service times out', async () => {
    // Mock R service to throw timeout error
    const { rAnalysisService } = await import('@/services/r-analysis');
    const timeoutError = new Error('Request timeout');
    timeoutError.name = 'AbortError';
    vi.mocked(rAnalysisService.descriptiveAnalysis).mockRejectedValue(timeoutError);

    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({
        projectId: testProjectId,
        analysisType: 'descriptive',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('timed out');
    expect(data.correlationId).toBeDefined();
  });

  it('should return 500 when CSV file is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({
        projectId: testProjectWithMissingCsvId,
        analysisType: 'descriptive',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Failed to read CSV file');
    expect(data.correlationId).toBeDefined();
  });

  it('should return 500 with R service error details', async () => {
    // Mock R service to throw error with userMessage
    const { rAnalysisService } = await import('@/services/r-analysis');
    const rError = new Error('R execution failed');
    (rError as any).userMessage = {
      message: 'Invalid data format: missing required columns',
    };
    vi.mocked(rAnalysisService.descriptiveAnalysis).mockRejectedValue(rError);

    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({
        projectId: testProjectId,
        analysisType: 'descriptive',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid data format: missing required columns');
    expect(data.correlationId).toBeDefined();
  });

  it('should include correlation ID in all error responses', async () => {
    // Test multiple error scenarios and verify correlation ID
    const errorScenarios = [
      {
        name: 'Missing project ID',
        body: {},
        expectedStatus: 400,
      },
      {
        name: 'Invalid project ID',
        body: { projectId: '00000000-0000-0000-0000-000000000000' },
        expectedStatus: 404,
      },
    ];

    for (const scenario of errorScenarios) {
      const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
        method: 'POST',
        body: JSON.stringify(scenario.body),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(scenario.expectedStatus);
      expect(data.success).toBe(false);
      expect(data.correlationId).toBeDefined();
      expect(typeof data.correlationId).toBe('string');
      expect(data.correlationId.length).toBeGreaterThan(0);
    }
  });

  it('should return 400 for unknown analysis type', async () => {
    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({
        projectId: testProjectId,
        analysisType: 'unknown_analysis_type',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Unknown analysis type');
    expect(data.correlationId).toBeDefined();
  });

  it('should return 400 for CFA without model syntax', async () => {
    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({
        projectId: testProjectId,
        analysisType: 'cfa',
        config: {},
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('CFA requires model syntax');
    expect(data.correlationId).toBeDefined();
  });

  it('should return 400 for ANOVA without required variables', async () => {
    const request = new NextRequest('http://localhost:3000/api/analysis/execute', {
      method: 'POST',
      body: JSON.stringify({
        projectId: testProjectId,
        analysisType: 'anova',
        config: { dependent: 'score1' },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('ANOVA requires dependent and independent variables');
    expect(data.correlationId).toBeDefined();
  });
});
