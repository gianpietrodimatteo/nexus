-- CreateEnum
CREATE TYPE "public"."NotificationMethod" AS ENUM ('EMAIL', 'SMS', 'SLACK');

-- CreateTable
CREATE TABLE "public"."ExceptionNotification" (
    "id" TEXT NOT NULL,
    "method" "public"."NotificationMethod" NOT NULL,
    "recipient" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "exceptionId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "ExceptionNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExceptionNotification_exceptionId_idx" ON "public"."ExceptionNotification"("exceptionId");

-- CreateIndex
CREATE INDEX "ExceptionNotification_userId_idx" ON "public"."ExceptionNotification"("userId");

-- AddForeignKey
ALTER TABLE "public"."ExceptionNotification" ADD CONSTRAINT "ExceptionNotification_exceptionId_fkey" FOREIGN KEY ("exceptionId") REFERENCES "public"."Exception"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExceptionNotification" ADD CONSTRAINT "ExceptionNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
