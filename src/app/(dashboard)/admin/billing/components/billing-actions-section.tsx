import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { PaymentMethodResponse } from '@/schemas/billing'

interface BillingActionsSectionProps {
  paymentMethod?: PaymentMethodResponse
  isLoading?: boolean
  onUpdatePaymentMethod?: () => void
  onDownloadContract?: () => void
  onContactSupport?: () => void
}

export function BillingActionsSection({ 
  paymentMethod, 
  isLoading, 
  onUpdatePaymentMethod,
  onDownloadContract,
  onContactSupport 
}: BillingActionsSectionProps) {
  if (isLoading) {
    return (
      <Card className="shadow-sm border border-[#E9E7E4]">
        <div className="p-8">
          <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Method Loading */}
            <div>
              <div className="h-5 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              <div className="bg-[#FAF9F8] border border-[#E9E7E4] rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-7 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-40 mt-4 animate-pulse"></div>
            </div>

            {/* Need Help Loading */}
            <div>
              <div className="h-5 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
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
                  <span className="text-white text-xs font-bold">
                    {paymentMethod?.cardBrand?.charAt(0) || 'V'}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-[#1F2937]">
                    {paymentMethod?.cardBrand || 'Visa'} ending in {paymentMethod?.cardLast4 || '4242'}
                  </div>
                  <div className="text-sm text-[#757575]">
                    Expires {paymentMethod?.cardExpMonth || 12}/{paymentMethod?.cardExpYear?.toString().slice(-2) || '25'}
                  </div>
                </div>
              </div>
            </div>
            <Button 
              variant="link" 
              className="text-[#4E86CF] p-0 h-auto mt-4"
              onClick={onUpdatePaymentMethod}
            >
              Update payment method
            </Button>
          </div>

          {/* Need Help */}
          <div>
            <h4 className="text-base font-medium text-[#1F2937] mb-4">Need Help?</h4>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={onDownloadContract}
              >
                Download Contract
              </Button>
              <Button 
                className="w-full justify-center bg-[#141417] hover:bg-[#141417]/90"
                onClick={onContactSupport}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}