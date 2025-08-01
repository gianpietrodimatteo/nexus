import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function BillingLoading() {
  return (
    <div className="flex flex-col">
      <div className="px-8 py-8 space-y-8">
        {/* Billing Overview Section */}
        <Card className="shadow-sm border border-[#E9E7E4]">
          <div className="p-8">
            <Skeleton className="h-8 w-48 mb-6" />
            
            {/* Plan and Credits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#FAF9F8] border border-[#E9E7E4] rounded-lg p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>

            {/* Usage Summary and Recent Invoices Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Usage Summary */}
              <Card className="shadow-sm border border-[#E9E7E4]">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between items-center py-3 border-b border-[#E9E7E4]">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Recent Invoices */}
              <Card className="shadow-sm border border-[#E9E7E4]">
                <div className="p-6">
                  <Skeleton className="h-6 w-32 mb-6" />
                  
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between items-center py-3 border-b border-[#E9E7E4]">
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-5 w-12" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        {/* Billing Actions Section */}
        <Card className="shadow-sm border border-[#E9E7E4]">
          <div className="p-8">
            <Skeleton className="h-6 w-32 mb-6" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Method */}
              <div>
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="bg-[#FAF9F8] border border-[#E9E7E4] rounded-lg p-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-7 h-6 rounded" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-4 w-40 mt-4" />
              </div>

              {/* Need Help */}
              <div>
                <Skeleton className="h-5 w-24 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 