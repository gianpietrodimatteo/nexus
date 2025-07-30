'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import type { AuthSession } from '@/server/auth/types'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Type guard for our custom session
  const authSession = session as AuthSession | null

  // Handle redirects in useEffect to avoid render-time navigation
  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!authSession) {
      router.push('/login')
      return
    }

    if (authSession.user.role !== 'ADMIN') {
      router.push('/client')
      return
    }
  }, [authSession, status, router])

  // Show loading while checking authentication
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  // Show loading while redirecting
  if (!authSession || authSession.user.role !== 'ADMIN') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Welcome to the Nexus admin panel
            </p>
          </div>

          <div className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                href="/admin/users"
                className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-2">User Management</h2>
                <p className="text-gray-600">Manage admin and SE users</p>
              </Link>

              <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow opacity-50">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Client Management</h2>
                <p className="text-gray-600">Coming soon...</p>
              </div>

              <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow opacity-50">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Reports</h2>
                <p className="text-gray-600">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}