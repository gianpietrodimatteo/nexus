import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { UsageSummary } from '@/schemas/billing'

interface UsageSummaryCardProps {
  usageSummary?: UsageSummary
  isLoading?: boolean
  onViewDetailedReport?: () => void
}

export function UsageSummaryCard({ usageSummary, isLoading, onViewDetailedReport }: UsageSummaryCardProps) {
  if (isLoading) {
    return (
      <Card className="shadow-sm border border-[#E9E7E4]">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-[#E9E7E4]">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border border-[#E9E7E4]">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-[#1F2937]">Usage Summary</h3>
          <Button 
            variant="link" 
            className="text-[#4E86CF] p-0 h-auto"
            onClick={onViewDetailedReport}
          >
            View detailed report →
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-[#E9E7E4]">
            <span className="text-[#3B3B3B]">API Calls</span>
            <span className="font-medium text-[#1F2937]">
              {usageSummary?.apiCalls?.toLocaleString() || 'No data'}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#E9E7E4]">
            <span className="text-[#3B3B3B]">Storage Used</span>
            <span className="font-medium text-[#1F2937]">
              {usageSummary?.storageUsedTB ? `${usageSummary.storageUsedTB.toFixed(1)} TB` : 'No data'}
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-[#3B3B3B]">Active Users</span>
            <span className="font-medium text-[#1F2937]">
              {usageSummary?.activeUsers || 'No data'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}