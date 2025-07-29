-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'SE', 'CLIENT');

-- CreateEnum
CREATE TYPE "public"."PipelinePhase" AS ENUM ('DISCOVERY_SURVEY', 'DISCOVERY_DEEP_DIVE', 'ADA_PROPOSAL_SENT', 'ADA_PROPOSAL_REVIEW', 'ADA_CONTRACT_SENT', 'ADA_CONTRACT_SIGNED', 'CREDENTIALS_COLLECTED', 'FACTORY_BUILD', 'TEST_PLAN_GENERATED', 'TESTING_STARTED', 'PRODUCTION_DEPLOY');

-- CreateEnum
CREATE TYPE "public"."ExceptionType" AS ENUM ('AUTHENTICATION', 'DATA_PROCESS', 'INTEGRATION', 'WORKFLOW_LOGIC', 'BROWSER_AUTOMATION');

-- CreateEnum
CREATE TYPE "public"."ExceptionSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "public"."ExceptionStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'IGNORED');

-- CreateEnum
CREATE TYPE "public"."ExecutionStatus" AS ENUM ('SUCCESS', 'FAILED', 'IN_PROGRESS');

-- CreateEnum
CREATE TYPE "public"."PricingModel" AS ENUM ('CONSUMPTION');

-- CreateEnum
CREATE TYPE "public"."ContractLength" AS ENUM ('MONTH', 'QUARTER', 'YEAR');

-- CreateEnum
CREATE TYPE "public"."BillingCadence" AS ENUM ('MONTHLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('STRIPE', 'ERP');

-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "public"."ProductUsageAPI" AS ENUM ('AIR_DIRECT', 'NEXUS_BASE');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('SURVEY_QUESTIONS', 'SURVEY_RESULTS', 'PROCESS_DOC', 'ADA_PROPOSAL', 'CONTRACT', 'FACTORY_MARKDOWN', 'TEST_PLAN');

-- CreateEnum
CREATE TYPE "public"."CredentialStatus" AS ENUM ('CONNECTED', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "public"."AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "public"."UserRole" NOT NULL,
    "organizationId" TEXT,
    "departmentId" TEXT,
    "billingAccess" BOOLEAN NOT NULL DEFAULT false,
    "adminAccess" BOOLEAN NOT NULL DEFAULT false,
    "notificationPreferences" JSONB,
    "hourlyRateCost" DECIMAL(65,30),
    "hourlyRateBillable" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "contractStartDate" TIMESTAMP(3),
    "contractEndDate" TIMESTAMP(3),
    "pipelinePhase" "public"."PipelinePhase" NOT NULL DEFAULT 'DISCOVERY_SURVEY',
    "subscriptionPlanId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "nodeCount" INTEGER NOT NULL DEFAULT 0,
    "timeSavedPerExecution" INTEGER,
    "moneySavedPerExecution" DECIMAL(65,30),
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Execution" (
    "id" TEXT NOT NULL,
    "status" "public"."ExecutionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "executionDetails" JSONB,
    "workflowId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Exception" (
    "id" TEXT NOT NULL,
    "type" "public"."ExceptionType" NOT NULL,
    "severity" "public"."ExceptionSeverity" NOT NULL,
    "status" "public"."ExceptionStatus" NOT NULL DEFAULT 'NEW',
    "remedy" TEXT,
    "workflowId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Exception_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pricingModel" "public"."PricingModel" NOT NULL DEFAULT 'CONSUMPTION',
    "contractLength" "public"."ContractLength" NOT NULL,
    "billingCadence" "public"."BillingCadence" NOT NULL,
    "setupFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "prepaymentPercentage" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "capAmount" DECIMAL(65,30),
    "overageCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "creditsPerPeriod" INTEGER NOT NULL DEFAULT 0,
    "pricePerCredit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "productUsageAPI" "public"."ProductUsageAPI" NOT NULL DEFAULT 'NEXUS_BASE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentMethod" "public"."PaymentMethod" NOT NULL,
    "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "stripeInvoiceId" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Credit" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "reason" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "appliedBy" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Credit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Credential" (
    "id" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "encryptedData" JSONB NOT NULL,
    "status" "public"."CredentialStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DocumentLink" (
    "id" TEXT NOT NULL,
    "type" "public"."DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PipelinePhaseLog" (
    "id" TEXT NOT NULL,
    "phase" "public"."PipelinePhase" NOT NULL,
    "organizationId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PipelinePhaseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "action" "public"."AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userId" TEXT,
    "organizationId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_AssignedSEs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AssignedSEs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "public"."User"("organizationId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE INDEX "Organization_contractStartDate_idx" ON "public"."Organization"("contractStartDate");

-- CreateIndex
CREATE INDEX "Organization_pipelinePhase_idx" ON "public"."Organization"("pipelinePhase");

-- CreateIndex
CREATE INDEX "Department_organizationId_idx" ON "public"."Department"("organizationId");

-- CreateIndex
CREATE INDEX "Workflow_organizationId_createdAt_idx" ON "public"."Workflow"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "Workflow_organizationId_isActive_idx" ON "public"."Workflow"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "Workflow_departmentId_idx" ON "public"."Workflow"("departmentId");

-- CreateIndex
CREATE INDEX "Execution_workflowId_createdAt_idx" ON "public"."Execution"("workflowId", "createdAt");

-- CreateIndex
CREATE INDEX "Execution_status_idx" ON "public"."Execution"("status");

-- CreateIndex
CREATE INDEX "Exception_organizationId_reportedAt_idx" ON "public"."Exception"("organizationId", "reportedAt");

-- CreateIndex
CREATE INDEX "Exception_status_severity_idx" ON "public"."Exception"("status", "severity");

-- CreateIndex
CREATE INDEX "Exception_workflowId_idx" ON "public"."Exception"("workflowId");

-- CreateIndex
CREATE INDEX "Invoice_organizationId_invoiceDate_idx" ON "public"."Invoice"("organizationId", "invoiceDate");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "public"."Invoice"("status");

-- CreateIndex
CREATE INDEX "Credit_organizationId_idx" ON "public"."Credit"("organizationId");

-- CreateIndex
CREATE INDEX "Credential_organizationId_idx" ON "public"."Credential"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_organizationId_serviceName_key" ON "public"."Credential"("organizationId", "serviceName");

-- CreateIndex
CREATE INDEX "DocumentLink_organizationId_idx" ON "public"."DocumentLink"("organizationId");

-- CreateIndex
CREATE INDEX "PipelinePhaseLog_organizationId_idx" ON "public"."PipelinePhaseLog"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PipelinePhaseLog_organizationId_phase_key" ON "public"."PipelinePhaseLog"("organizationId", "phase");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_timestamp_idx" ON "public"."AuditLog"("organizationId", "timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "public"."AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "public"."AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "_AssignedSEs_B_index" ON "public"."_AssignedSEs"("B");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Organization" ADD CONSTRAINT "Organization_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "public"."SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Department" ADD CONSTRAINT "Department_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Workflow" ADD CONSTRAINT "Workflow_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Workflow" ADD CONSTRAINT "Workflow_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Execution" ADD CONSTRAINT "Execution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exception" ADD CONSTRAINT "Exception_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exception" ADD CONSTRAINT "Exception_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exception" ADD CONSTRAINT "Exception_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Credit" ADD CONSTRAINT "Credit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Credit" ADD CONSTRAINT "Credit_appliedBy_fkey" FOREIGN KEY ("appliedBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Credential" ADD CONSTRAINT "Credential_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentLink" ADD CONSTRAINT "DocumentLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PipelinePhaseLog" ADD CONSTRAINT "PipelinePhaseLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AssignedSEs" ADD CONSTRAINT "_AssignedSEs_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AssignedSEs" ADD CONSTRAINT "_AssignedSEs_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
