"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AdminOptionCard } from "./components/admin-option-card"
import { ClientOptionCard } from "./components/client-option-card"
import type { AuthSession } from "@/server/auth/types"

export default function SESelectPage() {
  const { data: session, status } = useSession()
  const authSession = session as AuthSession | null
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    // Redirect non-SE users
    if (!authSession || authSession.user.role !== "SE") {
      router.push("/login")
    }
  }, [authSession, status, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authSession || authSession.user.role !== "SE") {
    return null // Will redirect via useEffect
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {authSession.user.name}
          </h1>
          <p className="text-gray-600">
            Choose how you'd like to access the platform today
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <AdminOptionCard />
          <ClientOptionCard />
        </div>
      </div>
    </div>
  )
}