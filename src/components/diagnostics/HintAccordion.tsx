import { StructuredHint } from '@/lib/diagnostics/hintsEngine'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Lightbulb, Sparkle, Path } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface HintAccordionProps {
  hints: StructuredHint[]
}

const TIER_META: Record<
  number,
  { label: string; icon: typeof Lightbulb; accent: string }
> = {
  1: { label: 'Nudge', icon: Lightbulb, accent: 'text-accent' },
  2: { label: 'Pictorial aid', icon: Sparkle, accent: 'text-primary' },
  3: { label: 'Step-by-step', icon: Path, accent: 'text-accent' },
}

export function HintAccordion({ hints }: HintAccordionProps) {
  if (hints.length === 0) return null

  return (
    <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Hints</p>
      <Accordion type="multiple" className="w-full">
        {hints.map((hint, index) => {
          const meta = TIER_META[hint.tier]
          const Icon = meta.icon
          return (
            <AccordionItem
              key={index}
              value={`hint-${index}`}
              className="border-b last:border-b-0"
            >
              <AccordionTrigger className="text-left hover:no-underline py-3">
                <span className="flex items-center gap-2">
                  <Icon
                    size={18}
                    weight="duotone"
                    className={cn(meta.accent)}
                  />
                  <span className="font-medium">
                    Tier {hint.tier}: {meta.label}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-left pb-3">
                {hint.content}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
