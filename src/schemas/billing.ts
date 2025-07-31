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
 * Schema for subscription plans
 */
export const subscriptionPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  pricePerMonth: z.number().positive('Price must be positive'),
  pricePerYear: z.number().positive('Price must be positive').optional(),
  features: z.array(z.string()).default([]),
  maxUsers: z.number().int().positive().optional(),
  maxWorkflows: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
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

// Export TypeScript types
export type BillingStatus = z.infer<typeof billingStatusSchema>
export type PaymentMethodType = z.infer<typeof paymentMethodTypeSchema>
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>
export type SubscriptionPlanInput = z.infer<typeof subscriptionPlanSchema>
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>
export type BillingInfoInput = z.infer<typeof billingInfoSchema>
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type InvoiceListFilter = z.infer<typeof invoiceListFilterSchema>
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>
export type UsageTrackingInput = z.infer<typeof usageTrackingSchema>