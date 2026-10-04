import {
  Tooltip as ShadcnTooltip,
  TooltipTrigger as ShadcnTooltipTrigger,
  TooltipContent as ShadcnTooltipContent,
  TooltipProvider as ShadcnTooltipProvider,
} from "@/components/ui/tooltip"
import type { ComponentProps } from "react"

type TooltipProps = ComponentProps<typeof ShadcnTooltip>
type TooltipTriggerProps = ComponentProps<typeof ShadcnTooltipTrigger>
type TooltipContentProps = ComponentProps<typeof ShadcnTooltipContent>
type TooltipProviderProps = ComponentProps<typeof ShadcnTooltipProvider>

export function Tooltip(props: TooltipProps) {
  return <ShadcnTooltip {...props} />
}

export function TooltipTrigger(props: TooltipTriggerProps) {
  return <ShadcnTooltipTrigger {...props} />
}

export function TooltipContent(props: TooltipContentProps) {
  return <ShadcnTooltipContent {...props} />
}

export function TooltipProvider(props: TooltipProviderProps) {
  return <ShadcnTooltipProvider {...props} />
}
