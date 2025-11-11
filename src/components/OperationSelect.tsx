import { OperationType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Plus, Minus, X, Divide, Shuffle } from '@phosphor-icons/react'

interface OperationSelectProps {
  selected: OperationType
  onSelect: (operation: OperationType) => void
}

const operations = [
  { type: 'addition' as OperationType, label: 'Addition', icon: Plus },
  { type: 'subtraction' as OperationType, label: 'Subtraction', icon: Minus },
  { type: 'multiplication' as OperationType, label: 'Multiplication', icon: X },
  { type: 'division' as OperationType, label: 'Division', icon: Divide },
  { type: 'mixed' as OperationType, label: 'Mixed', icon: Shuffle }
]

export function OperationSelect({ selected, onSelect }: OperationSelectProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {operations.map((op) => {
        const Icon = op.icon
        return (
          <Button
            key={op.type}
            variant={selected === op.type ? 'default' : 'outline'}
            onClick={() => onSelect(op.type)}
            className="gap-2 h-12 px-6"
          >
            <Icon size={20} weight="bold" />
            {op.label}
          </Button>
        )
      })}
    </div>
  )
}
