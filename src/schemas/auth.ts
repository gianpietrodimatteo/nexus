import { z } from 'zod'

/**
 * Authentication-related schemas
 */

/**
 * Schema for user login
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
})

/**
 * Schema for user registration
 */
export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  organizationName: z.string().min(1, 'Organization name is required').optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

/**
 * Schema for password reset request
 */
export const requestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
})

/**
 * Schema for password reset
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

/**
 * Schema for changing password (when logged in)
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

/**
 * Schema for updating user profile
 */
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  notificationPreferences: z.object({
    emailNotifications: z.boolean().default(true),
    smsNotifications: z.boolean().default(false),
    pushNotifications: z.boolean().default(true),
    marketingEmails: z.boolean().default(false),
  }).optional(),
})

/**
 * Schema for email verification
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

/**
 * Schema for resending verification email
 */
export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
})

/**
 * Schema for session refresh
 */
export const refreshSessionSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

// Export TypeScript types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>
export type RefreshSessionInput = z.infer<typeof refreshSessionSchema>