"use client"

import * as React from "react"
import { DayPicker, DayButton, getDefaultClassNames, type DateRange } from "react-day-picker"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toDateStr } from "@/lib/date-utils"

interface Props {
  unavailableDates: string[]
  priceOverrides: Record<string, number>
  basePrice: number
  selected?: DateRange
  onSelect?: (range: DateRange | undefined) => void
  numberOfMonths?: number
  readOnly?: boolean
}

export function AvailabilityCalendar({
  unavailableDates,
  priceOverrides,
  basePrice,
  selected,
  onSelect,
  numberOfMonths = 2,
  readOnly = false,
}: Props) {
  const unavailableSet = React.useMemo(
    () => new Set(unavailableDates),
    [unavailableDates]
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const disabled = React.useMemo(
    () => [
      { before: today },
      (date: Date) => unavailableSet.has(toDateStr(date)),
    ],
    [unavailableSet, today]
  )

  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      mode={readOnly ? undefined : "range"}
      selected={readOnly ? undefined : selected}
      onSelect={readOnly ? undefined : (onSelect as any)}
      numberOfMonths={numberOfMonths}
      disabled={disabled}
      showOutsideDays={false}
      className="bg-background p-3"
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("flex gap-4 flex-col md:flex-row relative", defaultClassNames.months),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-8 w-full px-8",
          defaultClassNames.month_caption
        ),
        caption_label: cn("select-none font-medium text-sm", defaultClassNames.caption_label),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        day: cn(
          "relative w-full h-full p-0 text-center group/day aspect-square select-none",
          "[&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day
        ),
        range_start: cn("rounded-l-md bg-accent", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn("text-muted-foreground aria-selected:text-muted-foreground", defaultClassNames.outside),
        disabled: cn("text-muted-foreground opacity-30 cursor-not-allowed", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => (
          <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
        ),
        Chevron: ({ orientation, className, ...props }) => {
          if (orientation === "left") return <ChevronLeftIcon className={cn("size-4", className)} {...props} />
          if (orientation === "right") return <ChevronRightIcon className={cn("size-4", className)} {...props} />
          return <ChevronDownIcon className={cn("size-4", className)} {...props} />
        },
        DayButton: ({ day, modifiers, className, ...props }) => {
          const dateStr = toDateStr(day.date)
          const price = priceOverrides[dateStr] ?? basePrice
          const isUnavailable = unavailableSet.has(dateStr)

          const ref = React.useRef<HTMLButtonElement>(null)
          React.useEffect(() => {
            if (modifiers.focused) ref.current?.focus()
          }, [modifiers.focused])

          return (
            <Button
              ref={ref}
              variant="ghost"
              size="icon"
              data-selected-single={
                modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
              }
              data-range-start={modifiers.range_start}
              data-range-end={modifiers.range_end}
              data-range-middle={modifiers.range_middle}
              className={cn(
                "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
                "data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground",
                "data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
                "data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
                "flex aspect-square size-auto w-full min-w-8 flex-col gap-0.5 leading-none font-normal",
                "data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md",
                isUnavailable && "line-through opacity-30",
                className
              )}
              {...props}
            >
              <span className="text-xs">{day.date.getDate()}</span>
              {!isUnavailable && price > 0 && (
                <span className="text-[9px] opacity-60 leading-none">€{price}</span>
              )}
            </Button>
          )
        },
      }}
    />
  )
}
