import {
  Calendar as ShadcnCalendar,
  CalendarDayButton as ShadcnCalendarDayButton,
} from "@/components/ui/calendar"
import type { ComponentProps } from "react"

type CalendarProps = ComponentProps<typeof ShadcnCalendar>
type CalendarDayButtonProps = ComponentProps<typeof ShadcnCalendarDayButton>

export function Calendar(props: CalendarProps) {
  return <ShadcnCalendar {...props} />
}

export function CalendarDayButton(props: CalendarDayButtonProps) {
  return <ShadcnCalendarDayButton {...props} />
}
