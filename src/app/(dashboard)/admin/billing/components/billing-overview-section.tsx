import { Card } from '@/components/ui/card'
import type { BillingOverview } from '@/schemas/billing'

interface BillingOverviewSectionProps {
  billingOverview?: BillingOverview
  isLoading?: boolean
}

export function BillingOverviewSection({ billingOverview, isLoading }: BillingOverviewSectionProps) {
  if (isLoading) {
    return (
      <Card className="shadow-sm border border-[#E9E7E4]">
        <div className="p-8">
          <div className="h-8 bg-gray-200 rounded mb-6 w-48 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#FAF9F8] border border-[#E9E7E4] rounded-lg p-6">
                <div className="h-4 bg-gray-200 rounded mb-2 w-24 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded mb-2 w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border border-[#E9E7E4]">
      <div className="p-8">
        <h2 className="text-2xl font-semibold text-[#1F2937] mb-6">Billing Overview</h2>
        
        {/* Plan and Credits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Plan */}
          <div className="bg-[#FAF9F8] border border-[#E9E7E4] rounded-lg p-6">
            <div className="text-sm text-[#757575] mb-2">Current Plan</div>
            <div className="text-xl font-semibold text-[#1F2937] mb-2">
              {billingOverview?.currentPlan.name || 'Enterprise'}
            </div>
            <div className="text-sm text-[#3B3B3B]">
              ${billingOverview?.currentPlan.monthlyFee || 2000}/month base fee
            </div>
          </div>

          {/* Credits Remaining */}
          <div className="bg-[#FAF9F8] border border-[#E9E7E4] rounded-lg p-6">
            <div className="text-sm text-[#757575] mb-2">Credits Remaining</div>
            <div className="text-xl font-semibold text-[#1F2937] mb-2">
              {billingOverview?.credits.remaining?.toLocaleString() || '8,450'}
            </div>
            <div className="text-sm text-[#3B3B3B]">
              Renews on {billingOverview?.credits.renewsOn 
                ? new Date(billingOverview.credits.renewsOn).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                : 'May 1, 2025'
              }
            </div>
          </div>

          {/* SE Hours This Month */}
          <div className="bg-[#FAF9F8] border border-[#E9E7E4] rounded-lg p-6">
            <div className="text-sm text-[#757575] mb-2">SE Hours This Month</div>
            {billingOverview?.seHours ? (
              <>
                <div className="text-xl font-semibold text-[#1F2937] mb-2">
                  {billingOverview.seHours.usedThisMonth.toFixed(2)} / {billingOverview.seHours.allocatedThisMonth.toFixed(2)}
                </div>
                <div className="text-sm text-[#3B3B3B]">
                  {billingOverview.seHours.remainingThisMonth.toFixed(2)} hours remaining
                </div>
              </>
            ) : (
              <>
                <div className="text-xl font-semibold text-[#1F2937] mb-2">No data</div>
                <div className="text-sm text-[#3B3B3B]">Hours not allocated</div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}