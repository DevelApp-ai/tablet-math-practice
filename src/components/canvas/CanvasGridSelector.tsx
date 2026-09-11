import { CanvasBackground } from '@/lib/types'
import { CANVAS_BACKGROUNDS, getCanvasGridStyle } from '@/lib/canvasBackground'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface CanvasGridSelectorProps {
  value: CanvasBackground
  onChange: (background: CanvasBackground) => void
  className?: string
}

export function CanvasGridSelector({
  value,
  onChange,
  className,
}: CanvasGridSelectorProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <Label className="text-sm font-medium text-muted-foreground">
        Workspace background
      </Label>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(val) => {
          if (val) onChange(val as CanvasBackground)
        }}
        aria-label="Workspace background"
      >
        {CANVAS_BACKGROUNDS.map((bg) => (
          <ToggleGroupItem
            key={bg}
            value={bg}
            aria-label={getCanvasGridStyle(bg).label}
            className="flex flex-col items-center gap-1 px-3 py-2"
          >
            <span
              className="block w-8 h-8 rounded-sm border border-border"
              style={{
                backgroundImage: getCanvasGridStyle(bg).backgroundImage,
                backgroundSize: getCanvasGridStyle(bg).backgroundSize,
              }}
              aria-hidden
            />
            <span className="text-xs">{getCanvasGridStyle(bg).label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
