import { useId } from "react"
import { motion, MotionConfig, type Transition } from "motion/react"
import { cn } from "@/lib/utils"

// Slide the active pill between options, matching the players reorder spring.
const pillTransition: Transition = { type: "spring", duration: 0.35, bounce: 0 }

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
  "aria-label"?: string
  "aria-labelledby"?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  ...aria
}: SegmentedControlProps<T>) {
  // Scope the pill's layoutId so several controls on one page don't share it.
  const pillId = useId()

  return (
    <MotionConfig reducedMotion="user" transition={pillTransition}>
      <div
        role="group"
        {...aria}
        className={cn("flex h-8 rounded-lg bg-muted p-[3px]", className)}
      >
        {options.map((option) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={cn(
                "relative rounded-md px-2.5 text-xs font-medium whitespace-nowrap transition-colors",
                active ? "text-foreground" : "text-foreground/60 hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId={pillId}
                  className="absolute inset-0 rounded-md bg-background shadow-sm"
                />
              )}
              <span className="relative">{option.label}</span>
            </button>
          )
        })}
      </div>
    </MotionConfig>
  )
}
