import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { AuthUser, AuthSession, AuthJWT } from './types'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            organization: true
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          organization: user.organization
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AuthUser
        // Add our custom properties to the token
        Object.assign(token, {
          role: authUser.role,
          organizationId: authUser.organizationId,
          organization: authUser.organization
        })
      }
      return token
    },
    async session({ session, token }): Promise<AuthSession> {
      if (session.user) {
        const authSession = session as AuthSession
        const authToken = token as AuthJWT
        
        authSession.user.id = authToken.sub!
        authSession.user.role = authToken.role
        authSession.user.organizationId = authToken.organizationId
        authSession.user.organization = authToken.organization
        
        return authSession
      }
      return session as AuthSession
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
} 