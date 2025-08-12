"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { IconSettings, IconUsers, IconChartBar } from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc"

export function AdminOptionCard() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { update } = useSession()

  // Context login mutation
  const loginWithContext = trpc.auth.loginWithContext.useMutation({
    onSuccess: async (data) => {
      try {
        // Update the session with admin impersonation context
        await update({
          impersonationContext: data.context
        })
        
        // Redirect to admin dashboard
        router.push(data.redirectUrl)
      } catch (error) {
        console.error('Failed to update session:', error)
        setIsLoading(false)
      }
    },
    onError: (error) => {
      console.error('Context login failed:', error)
      setIsLoading(false)
    }
  })

  const handleAdminAccess = async () => {
    setIsLoading(true)
    
    loginWithContext.mutate({
      type: 'ADMIN'
    })
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
            <IconSettings className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Admin Dashboard</CardTitle>
        </div>
        <CardDescription>
          Access the full admin interface with all management capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <IconUsers className="h-4 w-4" />
            <span>Manage users and organizations</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <IconChartBar className="h-4 w-4" />
            <span>View system-wide analytics</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <IconSettings className="h-4 w-4" />
            <span>Configure platform settings</span>
          </div>
        </div>
        <Button 
          onClick={handleAdminAccess}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Accessing..." : "Access Admin Dashboard"}
        </Button>
      </CardContent>
    </Card>
  )
}