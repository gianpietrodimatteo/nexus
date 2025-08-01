'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import type { AuthSession } from '@/server/auth/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ClientSelector } from '../clients/components/client-selector'
import { useAdminHeader } from '@/components/admin-header-context'

export default function AdminBillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('')
  const { setHeaderContent } = useAdminHeader()

  // Type guard for our custom session
  const authSession = session as AuthSession | null

  // Fetch organization-specific data only when an organization is selected
  const { data: organization, isLoading: orgLoading } = trpc.clients.getOrganization.useQuery(
    { organizationId: selectedOrganizationId },
    { enabled: !!selectedOrganizationId && authSession?.user?.role === 'ADMIN' }
  )

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

  // Set header content
  useEffect(() => {
    if (authSession?.user?.role === 'ADMIN') {
      setHeaderContent({
        title: 'Billing Center',
        actions: (
          <ClientSelector 
            selectedClientId={selectedOrganizationId}
            onClientSelect={setSelectedOrganizationId}
          />
        )
      })
    }

    // Cleanup function to reset header when component unmounts
    return () => {
      setHeaderContent(null)
    }
  }, [authSession, selectedOrganizationId, setHeaderContent])

  // Show loading while checking authentication
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  // Show loading while redirecting
  if (!authSession || authSession.user.role !== 'ADMIN') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  // Render content
  const renderContent = () => {
    if (!selectedOrganizationId) {
      return (
        <div className="text-center py-16">
          <div className="text-[#6B7280] text-lg">Select a client organization to view billing details</div>
          <div className="text-[#9CA3AF] text-sm mt-2">Choose from the dropdown in the header to get started</div>
        </div>
      )
    }

    return (
      <div className="space-y-8">
        {/* Billing Overview Section */}
        <Card className="shadow-sm border border-[#E9E7E4]">
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-[#1F2937] mb-6">Billing Overview</h2>
            
            {/* Plan and Credits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Current Plan */}
              <div className="bg-[#FAF9F8] border border-[#E9E7E4] rounded-lg p-6">
                <div className="text-sm text-[#757575] mb-2">Current Plan</div>
                <div className="text-xl font-semibold text-[#1F2937] mb-2">Enterprise</div>
                <div className="text-sm text-[#3B3B3B]">$2,000/month base fee</div>
              </div>

              {/* Credits Remaining */}
              <div className="bg-[#FAF9F8] border border-[#E9E7E4] rounded-lg p-6">
                <div className="text-sm text-[#757575] mb-2">Credits Remaining</div>
                <div className="text-xl font-semibold text-[#1F2937] mb-2">8,450</div>
                <div className="text-sm text-[#3B3B3B]">Renews on May 1, 2025</div>
              </div>

              {/* SE Hours This Month */}
              <div className="bg-[#FAF9F8] border border-[#E9E7E4] rounded-lg p-6">
                <div className="text-sm text-[#757575] mb-2">SE Hours This Month</div>
                <div className="text-xl font-semibold text-[#1F2937] mb-2">12.5 / 20</div>
                <div className="text-sm text-[#3B3B3B]">7.5 hours remaining</div>
              </div>
            </div>

            {/* Usage Summary and Recent Invoices Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Usage Summary */}
              <Card className="shadow-sm border border-[#E9E7E4]">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-[#1F2937]">Usage Summary</h3>
                    <Button variant="link" className="text-[#4E86CF] p-0 h-auto">
                      View detailed report →
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-[#E9E7E4]">
                      <span className="text-[#3B3B3B]">API Calls</span>
                      <span className="font-medium text-[#1F2937]">245,678</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#E9E7E4]">
                      <span className="text-[#3B3B3B]">Storage Used</span>
                      <span className="font-medium text-[#1F2937]">1.2 TB</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-[#3B3B3B]">Active Users</span>
                      <span className="font-medium text-[#1F2937]">127</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Recent Invoices */}
              <Card className="shadow-sm border border-[#E9E7E4]">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#1F2937] mb-6">Recent Invoices</h3>
                  
                  <div className="space-y-4">
                    {/* Invoice Item */}
                    <div className="flex justify-between items-center py-3 border-b border-[#E9E7E4]">
                      <div>
                        <div className="text-[#1F2937] font-medium">April 2025</div>
                        <div className="text-sm text-[#757575]">Invoice #2025-04</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1F2937]">$2,450.00</span>
                        <Badge variant="outline" className="text-xs">Paid</Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-[#E9E7E4]">
                      <div>
                        <div className="text-[#1F2937] font-medium">March 2025</div>
                        <div className="text-sm text-[#757575]">Invoice #2025-03</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1F2937]">$2,450.00</span>
                        <Badge variant="outline" className="text-xs">Paid</Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-3">
                      <div>
                        <div className="text-[#1F2937] font-medium">February 2025</div>
                        <div className="text-sm text-[#757575]">Invoice #2025-02</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1F2937]">$2,450.00</span>
                        <Badge variant="outline" className="text-xs">Paid</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button variant="link" className="text-[#4E86CF] p-0 h-auto">
                      View all invoices →
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        {/* Billing Actions Section */}
        <Card className="shadow-sm border border-[#E9E7E4]">
          <div className="p-8">
            <h3 className="text-xl font-semibold text-[#1F2937] mb-6">Billing Actions</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Method */}
              <div>
                <h4 className="text-base font-medium text-[#1F2937] mb-4">Payment Method</h4>
                <div className="bg-[#FAF9F8] border border-[#E9E7E4] rounded-lg p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-7 h-6 bg-[#1F2937] rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">V</span>
                    </div>
                    <div>
                      <div className="font-medium text-[#1F2937]">Visa ending in 4242</div>
                      <div className="text-sm text-[#757575]">Expires 12/25</div>
                    </div>
                  </div>
                </div>
                <Button variant="link" className="text-[#4E86CF] p-0 h-auto mt-4">
                  Update payment method
                </Button>
              </div>

              {/* Need Help */}
              <div>
                <h4 className="text-base font-medium text-[#1F2937] mb-4">Need Help?</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-center">
                    Download Contract
                  </Button>
                  <Button className="w-full justify-center bg-[#141417] hover:bg-[#141417]/90">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Main Content */}
      <div className="px-8 py-8">
        {renderContent()}
      </div>
    </div>
  )
} 