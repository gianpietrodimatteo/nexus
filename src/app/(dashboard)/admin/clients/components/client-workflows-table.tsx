import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Workflow {
  id: string
  name: string
  nodeCount: number
  timeSavedPerExecution?: number
  moneySavedPerExecution?: number
  isActive: boolean
  createdAt: string
  department?: {
    name: string
  }
  _count: {
    executions: number
    exceptions: number
  }
}

interface ClientWorkflowsTableProps {
  workflows: Workflow[]
  isLoading: boolean
  onAddWorkflow: () => void
}

export function ClientWorkflowsTable({ 
  workflows, 
  isLoading, 
  onAddWorkflow 
}: ClientWorkflowsTableProps) {
  const [editingValues, setEditingValues] = useState<{
    [workflowId: string]: {
      timeSaved?: number
      moneySaved?: number
    }
  }>({})

  const handleInputChange = (workflowId: string, field: 'timeSaved' | 'moneySaved', value: string) => {
    const numValue = parseFloat(value) || 0
    setEditingValues(prev => ({
      ...prev,
      [workflowId]: {
        ...prev[workflowId],
        [field]: numValue
      }
    }))
    // TODO: Implement save functionality
    console.log(`Update ${field} for workflow ${workflowId}:`, numValue)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return (
      <div className="text-sm">
        <div>{date.toLocaleDateString('en-US', { month: 'short' })}</div>
        <div>{date.toLocaleDateString('en-US', { day: 'numeric' })},</div>
        <div>{date.getFullYear()}</div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-[#1F2937]">Workflows</h3>
          <Button onClick={onAddWorkflow}>Add Workflow</Button>
        </div>
        <div className="text-center py-8">
          <div className="text-[#6B7280]">Loading workflows...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-[#1F2937]">Workflows</h3>
        <Button onClick={onAddWorkflow}>Add Workflow</Button>
      </div>
      
      {workflows.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-[#6B7280] text-lg">No workflows found</div>
          <div className="text-[#9CA3AF] text-sm mt-2">Create your first workflow to get started</div>
        </div>
      ) : (
        <div className="border rounded-lg bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#FAF9F8]">
                <TableHead className="w-[90px]">
                  <div className="text-center">
                    <div className="text-sm font-medium text-[#757575]">Create</div>
                    <div className="text-sm font-medium text-[#757575]">Date</div>
                  </div>
                </TableHead>
                <TableHead className="text-sm font-medium text-[#757575]">Department</TableHead>
                <TableHead className="text-sm font-medium text-[#757575]">
                  <div>
                    <div>Workflow</div>
                    <div>Name</div>
                  </div>
                </TableHead>
                <TableHead className="text-center text-sm font-medium text-[#757575]">
                  <div>
                    <div># of</div>
                    <div>Nodes</div>
                  </div>
                </TableHead>
                <TableHead className="text-center text-sm font-medium text-[#757575]">
                  <div>
                    <div># of</div>
                    <div>Executions</div>
                  </div>
                </TableHead>
                <TableHead className="text-center text-sm font-medium text-[#757575]">
                  <div>
                    <div># of</div>
                    <div>Exceptions</div>
                  </div>
                </TableHead>
                <TableHead className="text-right text-sm font-medium text-[#757575]">Time Saved</TableHead>
                <TableHead className="text-right text-sm font-medium text-[#757575]">$ Saved</TableHead>
                <TableHead className="text-center text-sm font-medium text-[#757575]">Status</TableHead>
                <TableHead className="text-right text-sm font-medium text-[#757575]">ROI Report</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((workflow) => (
                <TableRow key={workflow.id} className="border-b">
                  <TableCell className="p-4">
                    {formatDate(workflow.createdAt)}
                  </TableCell>
                  <TableCell className="text-[#1F2937]">
                    {workflow.department?.name || 'N/A'}
                  </TableCell>
                  <TableCell className="text-[#1F2937] font-medium">
                    {workflow.name}
                  </TableCell>
                  <TableCell className="text-center text-[#1F2937]">
                    {workflow.nodeCount}
                  </TableCell>
                  <TableCell className="text-center text-blue-600 font-medium">
                    {workflow._count.executions}
                  </TableCell>
                  <TableCell className="text-center text-blue-600 font-medium">
                    {workflow._count.exceptions}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 justify-end">
                      <Input
                        type="number"
                        value={editingValues[workflow.id]?.timeSaved ?? workflow.timeSavedPerExecution ?? 0}
                        className="w-20 h-7 text-right text-sm border border-[#E9E7E4]"
                        onChange={(e) => handleInputChange(workflow.id, 'timeSaved', e.target.value)}
                      />
                      <span className="text-sm text-[#757575]">min</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 justify-end">
                      <Input
                        type="number"
                        value={editingValues[workflow.id]?.moneySaved ?? Number(workflow.moneySavedPerExecution ?? 0)}
                        className="w-20 h-7 text-right text-sm border border-[#E9E7E4]"
                        onChange={(e) => handleInputChange(workflow.id, 'moneySaved', e.target.value)}
                      />
                      <span className="text-sm text-[#757575]">USD</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch 
                      checked={workflow.isActive}
                      onCheckedChange={(checked) => {
                        // TODO: Implement toggle functionality
                        console.log(`Toggle workflow ${workflow.id} to:`, checked)
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-blue-600 font-normal"
                    >
                      ROI Report
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}