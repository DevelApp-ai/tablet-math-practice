import { OperationType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Plus, Minus, X, Divide, Shuffle } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

interface OperationSelectProps {
  selected: OperationType
  onSelect: (operation: OperationType) => void
}

const operations = [
  { type: 'addition' as OperationType, icon: Plus },
  { type: 'subtraction' as OperationType, icon: Minus },
  { type: 'multiplication' as OperationType, icon: X },
  { type: 'division' as OperationType, icon: Divide },
  { type: 'mixed' as OperationType, icon: Shuffle }
]

export function OperationSelect({ selected, onSelect }: OperationSelectProps) {
  const { t } = useTranslation()
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
            {t(`operations.${op.type}`)}
          </Button>
        )
      })}
    </div>
  )
}
