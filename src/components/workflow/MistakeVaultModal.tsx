import { useMemo } from 'react'
import { StoredMistake } from '@/lib/types'
import { getOperationSymbol } from '@/lib/mathUtils'
import {
  getDueMistakes,
  getDueCount,
  getVaultSize,
} from '@/lib/repetition/spacedRepetition'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge as UIBadge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Vault, Trash, ArrowClockwise } from '@phosphor-icons/react'

interface MistakeVaultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vault: StoredMistake[]
  onRemove: (mistakeId: string) => void
  onClearAll: () => void
  onStartRemediation: () => void
}

const BOX_LABELS = ['Due now', 'Reviewing', 'Almost there', 'Graduated']

function boxLabel(level: number): string {
  return BOX_LABELS[level] ?? 'Due now'
}

function formatTimestamp(ts: number | null): string {
  if (ts === null) return 'never'
  const date = new Date(ts)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function MistakeVaultModal({
  open,
  onOpenChange,
  vault,
  onRemove,
  onClearAll,
  onStartRemediation,
}: MistakeVaultModalProps) {
  const dueCount = useMemo(() => getDueCount(vault), [vault])
  const vaultSize = useMemo(() => getVaultSize(vault), [vault])
  const dueMistakes = useMemo(() => getDueMistakes(vault), [vault])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Vault size={24} weight="duotone" className="text-primary" />
            Mistake Vault
          </DialogTitle>
          <DialogDescription>
            Problems you missed are stored here for spaced-repetition review. Get a problem
            right three times in a row and it graduates out of the vault.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <UIBadge variant="secondary" className="gap-1">
            <Vault size={14} />
            {vaultSize} stored
          </UIBadge>
          <UIBadge variant="destructive" className="gap-1">
            <ArrowClockwise size={14} />
            {dueCount} due now
          </UIBadge>
        </div>

        <Separator />

        {vaultSize === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Vault size={48} weight="duotone" className="mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">No mistakes stored yet</p>
            <p className="text-sm">Keep practicing — mistakes will appear here automatically.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {vault.map((mistake) => {
              const due = dueMistakes.some((d) => d.id === mistake.id)
              return (
                <li
                  key={mistake.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-lg">
                      {mistake.num1} {getOperationSymbol(mistake.operation)} {mistake.num2}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <UIBadge variant={due ? 'destructive' : 'outline'} className="text-xs">
                        {boxLabel(mistake.repetitionLevel)}
                      </UIBadge>
                      <span>
                        Streak: {mistake.consecutiveCorrect}/3
                      </span>
                      <span>·</span>
                      <span>Wrong: {mistake.incorrectAnswers.join(', ')}</span>
                      <span>·</span>
                      <span>Last seen: {formatTimestamp(mistake.lastReviewedAt)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(mistake.id)}
                    aria-label="Remove this mistake from the vault"
                  >
                    <Trash size={18} />
                  </Button>
                </li>
              )
            })}
          </ul>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            disabled={vaultSize === 0}
            className="gap-2"
          >
            <Trash size={16} />
            Clear Vault
          </Button>
          <Button
            onClick={onStartRemediation}
            disabled={dueCount === 0}
            className="gap-2"
          >
            <ArrowClockwise size={18} />
            Start Remediation ({dueCount} due)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
