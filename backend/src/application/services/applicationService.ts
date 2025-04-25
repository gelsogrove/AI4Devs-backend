import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UpdateStageRequest {
  stage: string;
  notes?: string;
}

export const updateCandidateStage = async (candidateId: number, data: UpdateStageRequest, updatedBy: string) => {
  // First, validate if the stage exists in interviewSteps
  const interviewStep = await prisma.interviewStep.findFirst({
    where: {
      name: data.stage
    }
  });

  if (!interviewStep) {
    throw new Error(`Invalid stage: ${data.stage}`);
  }

  // Find the candidate's application
  const application = await prisma.application.findFirst({
    where: {
      candidateId
    },
    include: {
      interviewStep: true
    }
  });

  if (!application) {
    throw new Error(`No application found for candidate ID: ${candidateId}`);
  }

  const previousStage = application.interviewStep.name;

  // Begin transaction
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Update the application with the new interview step
    const updatedApplication = await tx.application.update({
      where: {
        id: application.id
      },
      data: {
        currentInterviewStep: interviewStep.id,
        notes: data.notes || application.notes
      },
      include: {
        interviewStep: true
      }
    });

    // Create a timestamp for the update
    const updateTimestamp = new Date();

    // Return the formatted response
    return {
      success: true,
      message: 'Stage updated successfully',
      candidate_id: candidateId,
      previous_stage: previousStage,
      new_stage: data.stage,
      updated_by: updatedBy,
      updated_at: updateTimestamp
    };
  });
}; 