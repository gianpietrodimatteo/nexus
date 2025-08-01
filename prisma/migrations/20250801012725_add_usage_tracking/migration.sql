-- CreateTable
CREATE TABLE "public"."UsageTracking" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "workflowExecutions" INTEGER NOT NULL DEFAULT 0,
    "storageUsedGB" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "apiCalls" INTEGER NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentMethodData" (
    "id" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "cardLast4" TEXT,
    "cardBrand" TEXT,
    "cardExpMonth" INTEGER,
    "cardExpYear" INTEGER,
    "bankName" TEXT,
    "accountLast4" TEXT,
    "stripePaymentMethodId" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethodData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SEHoursTracking" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "allocatedHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "usedHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SEHoursTracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsageTracking_organizationId_year_month_idx" ON "public"."UsageTracking"("organizationId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "UsageTracking_organizationId_month_year_key" ON "public"."UsageTracking"("organizationId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethodData_organizationId_key" ON "public"."PaymentMethodData"("organizationId");

-- CreateIndex
CREATE INDEX "PaymentMethodData_organizationId_idx" ON "public"."PaymentMethodData"("organizationId");

-- CreateIndex
CREATE INDEX "SEHoursTracking_organizationId_year_month_idx" ON "public"."SEHoursTracking"("organizationId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "SEHoursTracking_organizationId_month_year_key" ON "public"."SEHoursTracking"("organizationId", "month", "year");

-- AddForeignKey
ALTER TABLE "public"."UsageTracking" ADD CONSTRAINT "UsageTracking_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentMethodData" ADD CONSTRAINT "PaymentMethodData_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SEHoursTracking" ADD CONSTRAINT "SEHoursTracking_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
