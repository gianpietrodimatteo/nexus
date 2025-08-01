import { z } from 'zod'

/**
 * Billing-related schemas
 */

/**
 * Billing status enum
 */
export const billingStatusSchema = z.enum([
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'SUSPENDED',
  'TRIAL'
])

/**
 * Payment method type enum
 */
export const paymentMethodTypeSchema = z.enum([
  'CREDIT_CARD',
  'BANK_TRANSFER',
  'PAYPAL',
  'WIRE_TRANSFER',
  'CHECK'
])

/**
 * Invoice status enum
 */
export const invoiceStatusSchema = z.enum([
  'DRAFT',
  'SENT',
  'PAID',
  'OVERDUE',
  'CANCELED',
  'REFUNDED'
])

/**
 * Pricing model enum
 */
export const pricingModelSchema = z.enum(['CONSUMPTION'])

/**
 * Contract length enum
 */
export const contractLengthSchema = z.enum(['MONTH', 'QUARTER', 'YEAR'])

/**
 * Billing cadence enum
 */
export const billingCadenceSchema = z.enum(['MONTHLY', 'QUARTERLY'])

/**
 * Product usage API enum
 */
export const productUsageAPISchema = z.enum(['AIR_DIRECT', 'NEXUS_BASE'])

/**
 * Schema for creating subscription plans
 */
export const createSubscriptionPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  pricingModel: pricingModelSchema.default('CONSUMPTION'),
  contractLength: contractLengthSchema,
  billingCadence: billingCadenceSchema,
  setupFee: z.number().min(0, 'Setup fee must be non-negative').default(0),
  prepaymentPercentage: z.number().min(0).max(100, 'Prepayment percentage must be between 0 and 100').default(0),
  capAmount: z.number().positive('Cap amount must be positive').optional(),
  overageCost: z.number().min(0, 'Overage cost must be non-negative').default(0),
  creditsPerPeriod: z.number().int().min(0, 'Credits per period must be non-negative').default(0),
  pricePerCredit: z.number().min(0, 'Price per credit must be non-negative').default(0),
  productUsageAPI: productUsageAPISchema.default('NEXUS_BASE'),
})

/**
 * Schema for updating subscription plans
 */
export const updateSubscriptionPlanSchema = createSubscriptionPlanSchema.partial().extend({
  id: z.string().min(1, 'Plan ID is required'),
})

/**
 * Schema for subscription plan response with client count
 */
export const subscriptionPlanWithClientsSchema = z.object({
  id: z.string(),
  name: z.string(),
  pricingModel: pricingModelSchema,
  contractLength: contractLengthSchema,
  billingCadence: billingCadenceSchema,
  setupFee: z.number(),
  prepaymentPercentage: z.number(),
  capAmount: z.number().nullable(),
  overageCost: z.number(),
  creditsPerPeriod: z.number(),
  pricePerCredit: z.number(),
  productUsageAPI: productUsageAPISchema,
  clientCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

/**
 * Schema for updating subscription
 */
export const updateSubscriptionSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  planId: z.string().min(1, 'Plan ID is required'),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
  effectiveDate: z.date().optional(),
})

/**
 * Schema for billing information
 */
export const billingInfoSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  billingEmail: z.string().email('Invalid billing email'),
  billingName: z.string().min(1, 'Billing name is required'),
  billingAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  taxId: z.string().optional(),
})

/**
 * Schema for payment method
 */
export const paymentMethodSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  type: paymentMethodTypeSchema,
  isPrimary: z.boolean().default(false),
  // Credit card specific fields
  cardLast4: z.string().length(4).optional(),
  cardBrand: z.string().optional(),
  cardExpMonth: z.number().int().min(1).max(12).optional(),
  cardExpYear: z.number().int().min(new Date().getFullYear()).optional(),
  // Bank transfer specific fields
  bankName: z.string().optional(),
  accountLast4: z.string().length(4).optional(),
})

/**
 * Schema for creating invoice
 */
export const createInvoiceSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  description: z.string().min(1, 'Invoice description is required'),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.date(),
  items: z.array(z.object({
    description: z.string().min(1, 'Item description is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    total: z.number().positive('Total must be positive'),
  })).min(1, 'At least one item is required'),
})

/**
 * Schema for invoice list filtering
 */
export const invoiceListFilterSchema = z.object({
  organizationId: z.string().optional(),
  status: invoiceStatusSchema.optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
})

/**
 * Schema for payment recording
 */
export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amount: z.number().positive('Amount must be positive'),
  paymentDate: z.date().default(() => new Date()),
  paymentMethod: paymentMethodTypeSchema,
  transactionId: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * Schema for usage tracking
 */
export const usageTrackingSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
  activeUsers: z.number().int().min(0),
  workflowExecutions: z.number().int().min(0),
  storageUsedGB: z.number().min(0),
  apiCalls: z.number().int().min(0),
})

/**
 * Schema for billing overview response
 */
export const billingOverviewSchema = z.object({
  currentPlan: z.object({
    name: z.string(),
    monthlyFee: z.number(),
    contractStartDate: z.date().nullable(),
    contractEndDate: z.date().nullable(),
  }),
  credits: z.object({
    remaining: z.number(),
    renewsOn: z.date().nullable(),
  }),
  seHours: z.object({
    usedThisMonth: z.number(),
    allocatedThisMonth: z.number(),
    remainingThisMonth: z.number(),
  }),
})

/**
 * Schema for usage summary response
 */
export const usageSummarySchema = z.object({
  apiCalls: z.number(),
  storageUsedTB: z.number(),
  activeUsers: z.number(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
})

/**
 * Schema for invoice response
 */
export const invoiceResponseSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  date: z.date(),
  dueDate: z.date(),
  amount: z.number(),
  status: invoiceStatusSchema,
  paymentMethod: z.string(),
})

/**
 * Schema for payment method response
 */
export const paymentMethodResponseSchema = z.object({
  type: z.string(),
  cardBrand: z.string().optional(),
  cardLast4: z.string().optional(),
  cardExpMonth: z.number().optional(),
  cardExpYear: z.number().optional(),
  isActive: z.boolean(),
})

/**
 * Schema for admin credit application
 */
export const applyCreditSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  amount: z.number().positive('Credit amount must be positive'),
  reason: z.string().min(1, 'Reason is required'),
})

// Export TypeScript types
export type BillingStatus = z.infer<typeof billingStatusSchema>
export type PaymentMethodType = z.infer<typeof paymentMethodTypeSchema>
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>
export type PricingModel = z.infer<typeof pricingModelSchema>
export type ContractLength = z.infer<typeof contractLengthSchema>
export type BillingCadence = z.infer<typeof billingCadenceSchema>
export type ProductUsageAPI = z.infer<typeof productUsageAPISchema>
export type CreateSubscriptionPlanInput = z.infer<typeof createSubscriptionPlanSchema>
export type UpdateSubscriptionPlanInput = z.infer<typeof updateSubscriptionPlanSchema>
export type SubscriptionPlanWithClients = z.infer<typeof subscriptionPlanWithClientsSchema>
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>
export type BillingInfoInput = z.infer<typeof billingInfoSchema>
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type InvoiceListFilter = z.infer<typeof invoiceListFilterSchema>
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>
export type UsageTrackingInput = z.infer<typeof usageTrackingSchema>
export type BillingOverview = z.infer<typeof billingOverviewSchema>
export type UsageSummary = z.infer<typeof usageSummarySchema>
export type InvoiceResponse = z.infer<typeof invoiceResponseSchema>
export type PaymentMethodResponse = z.infer<typeof paymentMethodResponseSchema>
export type ApplyCreditInput = z.infer<typeof applyCreditSchema>