-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "aiCategory" TEXT,
ADD COLUMN     "aiPriority" TEXT,
ADD COLUMN     "aiRecommendation" TEXT,
ADD COLUMN     "aiSentiment" TEXT,
ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "aiUrgency" TEXT,
ADD COLUMN     "duplicateComplaintId" TEXT,
ADD COLUMN     "duplicateSimilarity" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Complaint_aiCategory_idx" ON "Complaint"("aiCategory");

-- CreateIndex
CREATE INDEX "Complaint_aiPriority_idx" ON "Complaint"("aiPriority");
