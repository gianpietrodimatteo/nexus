import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

interface DocumentLinksProps {
  onLinksChange?: (links: DocumentLinks) => void
  initialLinks?: DocumentLinks
}

interface DocumentLinks {
  surveyQuestionsLink: string
  surveyResultsLink: string
  processDocumentationLink: string
  adaProposalLink: string
  contractLink: string
  factoryMarkdownLink: string
  testPlanLink: string
}

export function DocumentLinks({ onLinksChange, initialLinks }: DocumentLinksProps) {
  const handleInputChange = (field: keyof DocumentLinks, value: string) => {
    if (onLinksChange) {
      onLinksChange({
        surveyQuestionsLink: initialLinks?.surveyQuestionsLink || '',
        surveyResultsLink: initialLinks?.surveyResultsLink || '',
        processDocumentationLink: initialLinks?.processDocumentationLink || '',
        adaProposalLink: initialLinks?.adaProposalLink || '',
        contractLink: initialLinks?.contractLink || '',
        factoryMarkdownLink: initialLinks?.factoryMarkdownLink || '',
        testPlanLink: initialLinks?.testPlanLink || '',
        [field]: value
      })
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-[#1F2937]">Document Links</h3>
        
        <div className="space-y-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="survey-questions-link">Survey Questions</Label>
            <Input 
              type="url" 
              id="survey-questions-link" 
              placeholder="https://docs.example.com/survey"
              defaultValue={initialLinks?.surveyQuestionsLink}
              onChange={(e) => handleInputChange('surveyQuestionsLink', e.target.value)}
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="survey-results-link">Survey Results</Label>
            <Input 
              type="url" 
              id="survey-results-link" 
              placeholder="https://docs.example.com/results"
              defaultValue={initialLinks?.surveyResultsLink}
              onChange={(e) => handleInputChange('surveyResultsLink', e.target.value)}
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="process-documentation-link">Process Documentation</Label>
            <Input 
              type="url" 
              id="process-documentation-link" 
              placeholder="https://docs.example.com/process"
              defaultValue={initialLinks?.processDocumentationLink}
              onChange={(e) => handleInputChange('processDocumentationLink', e.target.value)}
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="ada-proposal-link">ADA Proposal</Label>
            <Input 
              type="url" 
              id="ada-proposal-link" 
              placeholder="https://docs.example.com/proposal"
              defaultValue={initialLinks?.adaProposalLink}
              onChange={(e) => handleInputChange('adaProposalLink', e.target.value)}
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="contract-link">Contract</Label>
            <Input 
              type="url" 
              id="contract-link" 
              placeholder="https://docs.example.com/contract"
              defaultValue={initialLinks?.contractLink}
              onChange={(e) => handleInputChange('contractLink', e.target.value)}
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="factory-markdown-link">Factory Markdown</Label>
            <Input 
              type="url" 
              id="factory-markdown-link" 
              placeholder="https://docs.example.com/factory-markdown"
              defaultValue={initialLinks?.factoryMarkdownLink}
              onChange={(e) => handleInputChange('factoryMarkdownLink', e.target.value)}
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="test-plan-link">Test Plan</Label>
            <Input 
              type="url" 
              id="test-plan-link" 
              placeholder="https://docs.example.com/test-plan"
              defaultValue={initialLinks?.testPlanLink}
              onChange={(e) => handleInputChange('testPlanLink', e.target.value)}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}