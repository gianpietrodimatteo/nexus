'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ClientPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if not authenticated
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!session) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Welcome to your Nexus client portal
            </p>
          </div>

          <div className="px-6 py-8">
            <p className="text-gray-600">Client features coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}