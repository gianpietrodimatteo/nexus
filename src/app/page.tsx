'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/login')
      return
    }

    // Redirect based on user role
    if (session.user.role === 'ADMIN') {
      router.push('/admin')
    } else {
      router.push('/client')
    }
  }, [session, status, router])

  // Show loading while redirecting
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Nexus Platform</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}