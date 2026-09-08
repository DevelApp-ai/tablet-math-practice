import { Problem } from '@/lib/types'
import { getOperationSymbol, formatNumber } from '@/lib/mathUtils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Printer } from '@phosphor-icons/react'
import { useState } from 'react'

interface PrintWorksheetProps {
  problems: Problem[]
  difficulty: string
  operation: string
  onGenerate: (count: number) => void
}

export function PrintWorksheet({ problems, difficulty, operation, onGenerate }: PrintWorksheetProps) {
  const [problemCount, setProblemCount] = useState('20')
  const [showDialog, setShowDialog] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleGenerate = () => {
    onGenerate(parseInt(problemCount))
    setShowDialog(true)
  }

  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2" onClick={() => setShowDialog(true)}>
            <Printer size={20} weight="duotone" />
            Print Worksheet
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print-only">
          <DialogHeader>
            <DialogTitle>Worksheet Preview</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-4 items-center no-print">
              <Select value={problemCount} onValueChange={setProblemCount}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 Problems</SelectItem>
                  <SelectItem value="20">20 Problems</SelectItem>
                  <SelectItem value="30">30 Problems</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleGenerate}>Generate New</Button>
              <Button onClick={handlePrint} variant="default" className="gap-2 ml-auto">
                <Printer size={20} />
                Print
              </Button>
            </div>

            <div className="border-0 rounded-lg p-4 md:p-8 bg-white worksheet-content print:w-full print:p-0">
              <WorksheetContent 
                problems={problems} 
                difficulty={difficulty}
                operation={operation}
              />
            </div>

            <div className="border-0 rounded-lg p-4 md:p-8 bg-white worksheet-content answer-key print:w-full print:p-0">
              <AnswerKey problems={problems} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function WorksheetContent({ problems, difficulty, operation }: { 
  problems: Problem[]
  difficulty: string
  operation: string 
}) {
  return (
    <div className="space-y-6">
      <div className="text-center border-b-2 pb-4">
        <h1 className="text-3xl font-bold">Math Practice Worksheet</h1>
        <p className="text-lg text-muted-foreground mt-2">
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} - {operation.charAt(0).toUpperCase() + operation.slice(1)}
        </p>
        <div className="mt-4 flex gap-8 justify-center text-sm">
          <div>Name: ___________________________</div>
          <div>Date: ___________________________</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 print:grid-cols-2 print:gap-2">
        {problems.map((problem, index) => (
          <div key={problem.id} className="flex items-center gap-3 md:gap-4 border-b pb-3 problem-row print:gap-1 print:pb-1">
            <span className="font-medium text-muted-foreground w-8 print:text-black print:w-6">{index + 1}.</span>
            <div className="flex items-center gap-2 md:gap-3 text-xl md:text-2xl print:text-base">
              <span className="print:text-black">{formatNumber(problem.operand1)}</span>
              <span className="font-bold text-primary print:text-black">{getOperationSymbol(problem.operation)}</span>
              <span className="print:text-black">{formatNumber(problem.operand2)}</span>
              <span className="print:text-black">=</span>
              <div className="border-b-2 border-foreground/20 w-24 md:w-32 h-8 answer-line print:border-b-2 print:border-black print:w-20 print:h-6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnswerKey({ problems }: { problems: Problem[] }) {
  return (
    <div className="space-y-6">
      <div className="text-center border-b-2 pb-4">
        <h2 className="text-2xl font-bold">Answer Key</h2>
        <p className="text-sm text-muted-foreground mt-1">For teacher/parent use only</p>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4 print:grid-cols-8 print:gap-1">
        {problems.map((problem, index) => (
          <div key={problem.id} className="text-center print:text-xs">
            <span className="text-sm text-muted-foreground print:text-black">{index + 1}.</span>
            <span className="ml-2 font-semibold print:text-black">{formatNumber(problem.correctAnswer)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
