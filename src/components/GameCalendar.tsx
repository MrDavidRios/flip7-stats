import { useMemo, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/Button"
import { Calendar } from "@/components/Calendar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/Tooltip"
import { cn, isSameDay } from "@/lib/utils"

interface GameCalendarProps {
  gameDates: Date[]
  selectedDate: Date | undefined
  onSelectedDateChange: (date: Date | undefined) => void
  className?: string
}

export function GameCalendar({
  gameDates,
  selectedDate,
  onSelectedDateChange,
  className,
}: GameCalendarProps) {
  const firstGameDate = useMemo(
    () =>
      gameDates.length
        ? new Date(Math.min(...gameDates.map((d) => d.getTime())))
        : undefined,
    [gameDates]
  )

  const latestGameDate = useMemo(
    () =>
      gameDates.length
        ? new Date(Math.max(...gameDates.map((d) => d.getTime())))
        : undefined,
    [gameDates]
  )

  const [month, setMonth] = useState<Date>(() => latestGameDate ?? new Date())

  return (
    <Calendar
      mode="single"
      className={cn("pointer-coarse:[--cell-size:--spacing(11)]", className)}
      startMonth={firstGameDate}
      endMonth={latestGameDate}
      month={month}
      onMonthChange={setMonth}
      components={{
        CaptionLabel: ({ children, className }) => (
          <button
            type="button"
            className={cn(
              className,
              "cursor-pointer rounded-md px-2 py-1 hover:bg-muted/60"
            )}
            onClick={() => setMonth(latestGameDate ?? new Date())}
          >
            {children}
          </button>
        ),
        PreviousMonthButton: (props) =>
          props["aria-disabled"] ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    {...props}
                    className={cn(props.className, "pointer-coarse:invisible")}
                  />
                }
              />
              <TooltipContent>No earlier games</TooltipContent>
            </Tooltip>
          ) : (
            <button {...props} />
          ),
        NextMonthButton: (props) =>
          props["aria-disabled"] ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    {...props}
                    className={cn(props.className, "pointer-coarse:invisible")}
                  />
                }
              />
              <TooltipContent>No later games</TooltipContent>
            </Tooltip>
          ) : (
            <button {...props} />
          ),
      }}
      footer={
        selectedDate && (
          <div className="flex justify-center pt-2 animate-in fade-in-0 duration-150">
            <Button
              variant="ghost"
              size="xs"
              className="text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                const root = e.currentTarget.closest(".rdp-root")
                onSelectedDateChange(undefined)
                // The button unmounts on clear; hand focus back to the grid.
                requestAnimationFrame(() =>
                  root?.querySelector<HTMLElement>("button[tabindex='0']")?.focus()
                )
              }}
            >
              <X data-icon="inline-start" />
              Clear selection
            </Button>
          </div>
        )
      }
      selected={selectedDate}
      onSelect={(date) =>
        onSelectedDateChange(
          date && selectedDate && isSameDay(date, selectedDate)
            ? undefined
            : date
        )
      }
      disabled={(date) => !gameDates.some((d) => isSameDay(d, date))}
    />
  )
}
