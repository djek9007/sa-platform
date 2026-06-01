-- AlterTable
ALTER TABLE "AssignmentSubmission" ADD COLUMN "feedback" TEXT,
ADD COLUMN "score" DOUBLE PRECISION,
ADD COLUMN "evaluatedAt" TIMESTAMP(3);
