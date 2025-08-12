"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { IconBuilding, IconEye, IconChevronDown } from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { trpc } from "@/lib/trpc"

export function ClientOptionCard() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { update } = useSession()

  // Get assigned organizations for the SE
  const { data: organizations, isLoading: isLoadingOrgs } = trpc.auth.getAssignedOrganizations.useQuery()

  // Context login mutation
  const loginWithContext = trpc.auth.loginWithContext.useMutation({
    onSuccess: async (data) => {
      try {
        // Update the session with impersonation context
        await update({
          impersonationContext: data.context
        })
        
        // Redirect to client page
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

  const handleClientAccess = async () => {
    if (!selectedOrgId) return
    
    setIsLoading(true)
    
    loginWithContext.mutate({
      type: 'CLIENT',
      organizationId: selectedOrgId
    })
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
            <IconBuilding className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl">Client View</CardTitle>
        </div>
        <CardDescription>
          View the platform from a specific client's perspective
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 space-y-4 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <IconEye className="h-4 w-4" />
            <span>See what your clients see</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <IconBuilding className="h-4 w-4" />
            <span>Organization-specific data</span>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Select Client Organization
            </label>
            <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingOrgs ? "Loading organizations..." : "Choose an organization"} />
              </SelectTrigger>
              <SelectContent>
                {organizations?.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          onClick={handleClientAccess}
          disabled={!selectedOrgId || isLoading || isLoadingOrgs}
          className="w-full"
          variant="outline"
        >
          {isLoading ? "Accessing..." : "Access Client View"}
        </Button>
      </CardContent>
    </Card>
  )
}