import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface PenInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onPenInput?: (value: string) => void
}

export const PenInput = forwardRef<HTMLInputElement, PenInputProps>(
  ({ className, type = 'text', onPenInput, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(e)
      if (onPenInput) onPenInput(e.target.value)
    }

    const handlePointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
      // Ensure pen/stylus input gets focus
      if (e.pointerType === 'pen') {
        e.currentTarget.focus()
      }
    }

    return (
      <input
        ref={ref}
        type={type}
        inputMode="decimal"
        enterKeyHint="done"
        className={cn(
          'flex h-20 md:h-24 w-full rounded-md border border-input bg-background',
          'px-4 md:px-6 py-2 text-3xl md:text-4xl font-medium text-center',
          'transition-colors file:border-0 file:bg-transparent file:text-sm',
          'file:font-medium placeholder:text-muted-foreground/60',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'touch-action: none', // Important for pen input
          className
        )}
        onPointerDown={handlePointerDown}
        onChange={handleChange}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        {...props}
      />
    )
  }
)

PenInput.displayName = 'PenInput'
