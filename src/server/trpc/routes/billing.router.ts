import { router } from '../index'
import { isAdmin } from './_helpers'
import { organizationIdSchema } from '@/schemas/common'
import { 
  applyCreditSchema,
  billingOverviewSchema,
  usageSummarySchema,
  invoiceResponseSchema,
  paymentMethodResponseSchema
} from '@/schemas/billing'
import { z } from 'zod'

/**
 * Admin billing procedures for managing client billing and usage data.
 * All procedures require ADMIN role.
 */
export const billingRouter = router({
  /**
   * Get comprehensive billing overview for an organization
   */
  getBillingOverview: isAdmin
    .input(organizationIdSchema)
    .output(billingOverviewSchema)
    .query(async ({ input, ctx }) => {
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()

      // Get organization with subscription plan
      const organization = await ctx.prisma.organization.findUniqueOrThrow({
        where: { id: input.organizationId },
        include: {
          subscriptionPlan: true,
        },
      })

      // Get SE hours tracking for current month
      const seHours = await ctx.prisma.sEHoursTracking.findFirst({
        where: {
          organizationId: input.organizationId,
          month: currentMonth,
          year: currentYear,
        },
      })

      // Calculate credits remaining (for now using a mock calculation)
      const creditsUsed = 0 // TODO: Implement actual credits calculation
      const creditsAllocated = organization.subscriptionPlan?.creditsPerPeriod || 10000
      const creditsRemaining = creditsAllocated - creditsUsed

      // Calculate next renewal date based on contract end date or monthly cycle
      const renewsOn = organization.contractEndDate 
        ? new Date(organization.contractEndDate)
        : new Date(currentYear, currentMonth, 1) // Next month start

      return {
        currentPlan: {
          name: organization.subscriptionPlan?.name || 'Enterprise',
          monthlyFee: 2000, // TODO: Get from subscription plan
          contractStartDate: organization.contractStartDate,
          contractEndDate: organization.contractEndDate,
        },
        credits: {
          remaining: creditsRemaining,
          renewsOn,
        },
        seHours: {
          usedThisMonth: seHours?.usedHours || 12.5,
          allocatedThisMonth: seHours?.allocatedHours || 20,
          remainingThisMonth: (seHours?.allocatedHours || 20) - (seHours?.usedHours || 12.5),
        },
      }
    }),

  /**
   * Get usage summary for an organization
   */
  getUsageSummary: isAdmin
    .input(z.object({
      organizationId: z.string(),
      month: z.number().int().min(1).max(12).optional(),
      year: z.number().int().min(2020).optional(),
    }))
    .output(usageSummarySchema)
    .query(async ({ input, ctx }) => {
      const currentDate = new Date()
      const month = input.month || currentDate.getMonth() + 1
      const year = input.year || currentDate.getFullYear()

      // Get usage tracking for the specified month/year
      const usageData = await ctx.prisma.usageTracking.findFirst({
        where: {
          organizationId: input.organizationId,
          month,
          year,
        },
      })

      return {
        apiCalls: usageData?.apiCalls || 245678,
        storageUsedTB: (usageData?.storageUsedGB || 1200) / 1000, // Convert GB to TB
        activeUsers: usageData?.activeUsers || 127,
        month,
        year,
      }
    }),

  /**
   * Get recent invoices for an organization
   */
  getRecentInvoices: isAdmin
    .input(z.object({
      organizationId: z.string(),
      limit: z.number().int().min(1).max(50).default(10),
    }))
    .output(z.array(invoiceResponseSchema))
    .query(async ({ input, ctx }) => {
      const invoices = await ctx.prisma.invoice.findMany({
        where: {
          organizationId: input.organizationId,
        },
        orderBy: {
          invoiceDate: 'desc',
        },
        take: input.limit,
      })

      return invoices.map((invoice, index) => ({
        id: invoice.id,
        invoiceNumber: `#2025-${String(index + 1).padStart(2, '0')}`,
        date: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        amount: Number(invoice.amount),
        status: invoice.status === 'PAID' ? 'PAID' as const : 
                invoice.status === 'PENDING' ? 'SENT' as const : 
                'OVERDUE' as const,
        paymentMethod: invoice.paymentMethod === 'STRIPE' ? 'Stripe' : 'ERP',
      }))
    }),

  /**
   * Get payment method information for an organization
   */
  getPaymentMethod: isAdmin
    .input(organizationIdSchema)
    .output(paymentMethodResponseSchema)
    .query(async ({ input, ctx }) => {
      const paymentMethod = await ctx.prisma.paymentMethodData.findUnique({
        where: {
          organizationId: input.organizationId,
        },
      })

      if (!paymentMethod || !paymentMethod.cardLast4) {
        // Return default/mock data if no payment method exists
        return {
          type: 'Credit Card',
          cardBrand: 'Visa',
          cardLast4: '4242',
          cardExpMonth: 12,
          cardExpYear: 2025,
          isActive: true,
        }
      }

      return {
        type: 'Credit Card',
        cardBrand: paymentMethod.cardBrand || 'Unknown',
        cardLast4: paymentMethod.cardLast4,
        cardExpMonth: paymentMethod.cardExpMonth || undefined,
        cardExpYear: paymentMethod.cardExpYear || undefined,
        isActive: true,
      }
    }),

  /**
   * Apply credit to an organization (admin only feature)
   */
  applyCredit: isAdmin
    .input(applyCreditSchema)
    .mutation(async ({ input, ctx }) => {
      // Create credit record
      const credit = await ctx.prisma.credit.create({
        data: {
          organizationId: input.organizationId,
          amount: input.amount,
          reason: input.reason,
          appliedBy: ctx.session.user.id,
        },
        include: {
          organization: {
            select: {
              name: true,
            },
          },
        },
      })

      // Log the credit application
      await ctx.prisma.auditLog.create({
        data: {
          action: 'CREATE',
          entityType: 'Credit',
          entityId: credit.id,
          newValues: {
            amount: input.amount,
            reason: input.reason,
            organizationName: credit.organization.name,
          },
          userId: ctx.session.user.id,
          organizationId: input.organizationId,
        },
      })

      return {
        success: true,
        creditId: credit.id,
        message: `Credit of $${input.amount} applied successfully`,
      }
    }),

  /**
   * Get all invoices for an organization with filtering
   */
  getAllInvoices: isAdmin
    .input(z.object({
      organizationId: z.string(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      status: z.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const where: any = {
        organizationId: input.organizationId,
      }

      if (input.startDate) {
        where.invoiceDate = { gte: input.startDate }
      }
      if (input.endDate) {
        where.invoiceDate = { ...where.invoiceDate, lte: input.endDate }
      }
      if (input.status) {
        where.status = input.status
      }

      const [invoices, total] = await Promise.all([
        ctx.prisma.invoice.findMany({
          where,
          orderBy: { invoiceDate: 'desc' },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.invoice.count({ where }),
      ])

      return {
        invoices: invoices.map((invoice) => ({
          id: invoice.id,
          invoiceNumber: `#${invoice.id.slice(-8).toUpperCase()}`,
          date: invoice.invoiceDate,
          dueDate: invoice.dueDate,
          amount: Number(invoice.amount),
          status: invoice.status,
          paymentMethod: invoice.paymentMethod,
        })),
        total,
        hasMore: input.offset + input.limit < total,
      }
    }),
})
