import { User as PrismaUser, Organization } from '@prisma/client'
import { DefaultSession, User as NextAuthUser } from 'next-auth'
import { JWT } from 'next-auth/jwt'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: PrismaUser['role']
  organizationId: string | null
  organization: Organization | null
}

export interface AuthSession extends DefaultSession {
  user: AuthUser & DefaultSession['user']
}

// Custom properties we add to the JWT
export interface AuthTokenData {
  role: PrismaUser['role']
  organizationId: string | null
  organization: Organization | null
}

// Type for our enhanced JWT token
export type AuthJWT = JWT & AuthTokenData 