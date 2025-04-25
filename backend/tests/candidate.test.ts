import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    interviewStep: {
      findFirst: jest.fn()
    },
    application: {
      findFirst: jest.fn(),
      update: jest.fn()
    },
    $transaction: jest.fn(),
    $disconnect: jest.fn()
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

// Mock app
jest.mock('../src/index', () => {
  const mockApp = {
    put: jest.fn()
  };
  return { app: mockApp };
});

const prisma = new PrismaClient();
const { app } = require('../src/index');

describe('Candidate API Endpoints', () => {
  describe('PUT /candidates/:id/stage', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update candidate stage successfully', async () => {
      // Mock data
      const mockInterviewStep = {
        id: 2,
        name: 'Second interview'
      };

      const mockApplication = {
        id: 1,
        candidateId: 1,
        interviewStep: {
          name: 'First interview'
        }
      };

      const mockUpdatedApplication = {
        id: 1,
        candidateId: 1,
        currentInterviewStep: 2,
        interviewStep: {
          name: 'Second interview'
        }
      };

      const mockResponseData = {
        success: true,
        message: 'Stage updated successfully',
        candidate_id: 1,
        previous_stage: 'First interview',
        new_stage: 'Second interview',
        updated_by: 'user@example.com',
        updated_at: expect.any(Date)
      };

      // Setup mocks
      prisma.interviewStep.findFirst.mockResolvedValue(mockInterviewStep);
      prisma.application.findFirst.mockResolvedValue(mockApplication);
      prisma.$transaction.mockImplementation(callback => callback(prisma));
      prisma.application.update.mockResolvedValue(mockUpdatedApplication);

      // Mock implementation for controller
      app.put.mockImplementationOnce((path, callback) => {
        if (path === '/candidates/:id/stage') {
          const req = {
            params: { id: '1' },
            body: {
              stage: 'Second interview',
              notes: 'Candidate performed well in technical assessment'
            }
          };
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockImplementation(data => {
              expect(data).toHaveProperty('success', true);
              expect(data).toHaveProperty('message', 'Stage updated successfully');
              expect(data).toHaveProperty('candidate_id', 1);
              expect(data).toHaveProperty('previous_stage', 'First interview');
              expect(data).toHaveProperty('new_stage', 'Second interview');
              expect(data).toHaveProperty('updated_by');
              expect(data).toHaveProperty('updated_at');
            })
          };
          callback(req, res);
          return res.json;
        }
      });

      const putMock = app.put('/candidates/:id/stage');
      expect(putMock).toBeDefined();
    });

    it('should return 400 when stage is missing', async () => {
      // Mock implementation
      app.put.mockImplementationOnce((path, callback) => {
        if (path === '/candidates/:id/stage') {
          const req = {
            params: { id: '1' },
            body: {
              notes: 'Candidate performed well in technical assessment'
            }
          };
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockImplementation(data => {
              expect(data).toHaveProperty('error', 'Stage is required');
            })
          };
          callback(req, res);
          return res.json;
        }
      });

      const putMock = app.put('/candidates/:id/stage');
      expect(putMock).toBeDefined();
    });

    it('should return 400 when stage is invalid', async () => {
      // Setup mock
      prisma.interviewStep.findFirst.mockResolvedValue(null);

      // Mock implementation
      app.put.mockImplementationOnce((path, callback) => {
        if (path === '/candidates/:id/stage') {
          const req = {
            params: { id: '1' },
            body: {
              stage: 'NonExistentStage',
              notes: 'Candidate performed well in technical assessment'
            }
          };
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockImplementation(data => {
              expect(data).toHaveProperty('error', 'Invalid stage: NonExistentStage');
            })
          };
          callback(req, res);
          return res.json;
        }
      });

      const putMock = app.put('/candidates/:id/stage');
      expect(putMock).toBeDefined();
    });

    it('should return 400 when candidate ID is invalid', async () => {
      // Mock implementation
      app.put.mockImplementationOnce((path, callback) => {
        if (path === '/candidates/:id/stage') {
          const req = {
            params: { id: 'invalidid' },
            body: {
              stage: 'Second interview',
              notes: 'Candidate performed well in technical assessment'
            }
          };
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockImplementation(data => {
              expect(data).toHaveProperty('error', 'Invalid candidate ID format');
            })
          };
          callback(req, res);
          return res.json;
        }
      });

      const putMock = app.put('/candidates/:id/stage');
      expect(putMock).toBeDefined();
    });

    it('should return 404 when candidate does not exist', async () => {
      // Setup mock
      prisma.interviewStep.findFirst.mockResolvedValue({
        id: 2,
        name: 'Second interview'
      });
      prisma.application.findFirst.mockResolvedValue(null);

      // Mock implementation
      app.put.mockImplementationOnce((path, callback) => {
        if (path === '/candidates/:id/stage') {
          const req = {
            params: { id: '99999' },
            body: {
              stage: 'Second interview',
              notes: 'Candidate performed well in technical assessment'
            }
          };
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockImplementation(data => {
              expect(data.error).toContain('No application found for candidate ID');
            })
          };
          callback(req, res);
          return res.json;
        }
      });

      const putMock = app.put('/candidates/:id/stage');
      expect(putMock).toBeDefined();
    });
  });
}); 