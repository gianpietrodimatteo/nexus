import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface PipelinePhase {
  id: number
  name: string
  completedAt?: string
  isCompleted: boolean
}

interface PipelineProgressProps {
  clientId: string
  phases: PipelinePhase[]
  onMarkComplete?: (phaseId: number) => void
}

const DEFAULT_PHASES: PipelinePhase[] = [
  { id: 1, name: "Discovery: Initial Survey", isCompleted: false },
  { id: 2, name: "Discovery: Process deep dive", isCompleted: false },
  { id: 3, name: "ADA Proposal Sent", isCompleted: false },
  { id: 4, name: "ADA Proposal Review done", isCompleted: false },
  { id: 5, name: "ADA Contract Sent", isCompleted: false },
  { id: 6, name: "ADA Contract Signed", isCompleted: false },
  { id: 7, name: "Credentials collected", isCompleted: false },
  { id: 8, name: "Factory build initiated", isCompleted: false },
  { id: 9, name: "Test plan generated", isCompleted: false },
  { id: 10, name: "Testing started", isCompleted: false },
  { id: 11, name: "Production deploy", isCompleted: false }
]

export function PipelineProgress({ 
  clientId, 
  phases = DEFAULT_PHASES, 
  onMarkComplete 
}: PipelineProgressProps) {
  // Find the first incomplete phase
  const firstIncompletePhaseIndex = phases.findIndex(phase => !phase.isCompleted)
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-[#1F2937]">Pipeline Progress</h3>
        
        <div className="space-y-4">
          {phases.map((phase, index) => (
            <div key={phase.id} className="flex items-center gap-4">
              {/* Status indicator */}
              <div className="flex-shrink-0">
                {phase.isCompleted ? (
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-gray-300" />
                )}
              </div>

              {/* Phase content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      phase.isCompleted ? 'text-[#1F2937]' : 'text-[#6B7280]'
                    }`}>
                      {phase.id}. {phase.name}
                    </p>
                    {phase.isCompleted && phase.completedAt && (
                      <p className="text-xs text-[#6B7280] mt-1">
                        Completed: {formatDate(phase.completedAt)}
                      </p>
                    )}
                  </div>

                  {/* Action button - only show for first incomplete phase */}
                  {!phase.isCompleted && index === firstIncompletePhaseIndex && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-4"
                      onClick={() => onMarkComplete?.(phase.id)}
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress summary */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B7280]">
              Progress: {phases.filter(p => p.isCompleted).length} of {phases.length} phases complete
            </span>
            <span className="text-[#1F2937] font-medium">
              {Math.round((phases.filter(p => p.isCompleted).length / phases.length) * 100)}%
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(phases.filter(p => p.isCompleted).length / phases.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}