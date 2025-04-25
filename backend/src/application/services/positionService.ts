import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GetCandidatesOptions {
  sort?: 'name' | 'score' | 'stage';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  stage?: string;
  minScore?: number;
}

interface ApplicationWithRelations {
  candidateId: number;
  candidate: {
    id: number;
    firstName: string;
    lastName: string;
  };
  interviewStep: {
    name: string;
  };
  interviews: Array<{
    interviewDate: Date;
    score: number | null;
  }>;
}

export const getCandidatesByPositionId = async (positionId: number, options: GetCandidatesOptions = {}) => {
  // Set default options
  const {
    sort = 'name',
    order = 'asc',
    page = 1,
    limit = 20,
    stage,
    minScore
  } = options;

  // Calculate skip for pagination
  const skip = (page - 1) * limit;

  // Base query filter
  const where: any = {
    positionId
  };

  // Add stage filter if provided
  if (stage) {
    where.interviewStep = {
      name: stage
    };
  }

  // First, count total records for pagination
  const total = await prisma.application.count({
    where
  });

  // Build query based on sorting options
  let orderBy: any = {};
  
  switch (sort) {
    case 'name':
      orderBy = {
        candidate: {
          lastName: order
        }
      };
      break;
    case 'stage':
      orderBy = {
        interviewStep: {
          orderIndex: order
        }
      };
      break;
    default:
      // Default sort by id
      orderBy = {
        id: order
      };
  }

  // Fetch the applications with related data
  const applications = await prisma.application.findMany({
    where,
    orderBy,
    skip,
    take: limit,
    include: {
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      interviewStep: {
        select: {
          name: true
        }
      },
      interviews: {
        select: {
          interviewDate: true,
          score: true
        },
        orderBy: {
          interviewDate: 'desc'
        }
      }
    }
  });

  // Process and format the data
  const candidates = applications.map((app: ApplicationWithRelations) => {
    // Calculate average score from interviews
    const scores = app.interviews.map(interview => interview.score).filter(Boolean) as number[];
    const averageScore = scores.length > 0 ? 
      parseFloat((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)) : 
      null;
    
    // Find the latest interview date
    const latestInterview = app.interviews.length > 0 ? 
      app.interviews.sort((a, b) => 
        new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime()
      )[0] : 
      null;

    // Skip this candidate if minScore is provided and the candidate's score is below it
    if (minScore !== undefined && (averageScore === null || averageScore < minScore)) {
      return null;
    }

    return {
      candidate_id: app.candidateId,
      candidate_name: `${app.candidate.firstName} ${app.candidate.lastName}`,
      current_interview_step: app.interviewStep.name,
      average_score: averageScore,
      last_interview_date: latestInterview?.interviewDate || null
    };
  }).filter(Boolean); // Remove null values (filtered by minScore)

  // Calculate total pages
  const pages = Math.ceil(total / limit);

  return {
    data: candidates,
    pagination: {
      total,
      page,
      limit,
      pages
    }
  };
}; 