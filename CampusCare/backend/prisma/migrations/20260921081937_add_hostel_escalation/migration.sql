-- CreateEnum
CREATE TYPE "ComplaintDepartment" AS ENUM ('HOSTEL', 'ACADEMICS', 'FEES', 'LIBRARY', 'TRANSPORT', 'INFRASTRUCTURE', 'IT', 'OTHER');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ESCALATION';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'WARDEN';

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "department" "ComplaintDepartment" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "escalatedAt" TIMESTAMP(3),
ADD COLUMN     "escalationLevel" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "escalationReason" TEXT;

-- CreateTable
CREATE TABLE "ComplaintEscalation" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "message" TEXT,
    "fromLevel" INTEGER NOT NULL,
    "toLevel" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintEscalation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComplaintEscalation_complaintId_idx" ON "ComplaintEscalation"("complaintId");

-- CreateIndex
CREATE INDEX "ComplaintEscalation_studentId_idx" ON "ComplaintEscalation"("studentId");

-- CreateIndex
CREATE INDEX "ComplaintEscalation_fromLevel_idx" ON "ComplaintEscalation"("fromLevel");

-- CreateIndex
CREATE INDEX "ComplaintEscalation_toLevel_idx" ON "ComplaintEscalation"("toLevel");

-- CreateIndex
CREATE INDEX "ComplaintEscalation_createdAt_idx" ON "ComplaintEscalation"("createdAt");

-- CreateIndex
CREATE INDEX "Complaint_department_idx" ON "Complaint"("department");

-- CreateIndex
CREATE INDEX "Complaint_escalationLevel_idx" ON "Complaint"("escalationLevel");

-- CreateIndex
CREATE INDEX "Notification_complaintId_idx" ON "Notification"("complaintId");

-- AddForeignKey
ALTER TABLE "ComplaintEscalation" ADD CONSTRAINT "ComplaintEscalation_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintEscalation" ADD CONSTRAINT "ComplaintEscalation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
