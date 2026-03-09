"use client"

import { cn } from "@/lib/utils"
import { toDateStr } from "@/lib/date-utils"

interface Props {
  dates: Date[]
  cellWidth: number
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function GridHeader({ dates, cellWidth }: Props) {
  const today = toDateStr(new Date())

  return (
    <div className="flex border-b bg-muted/40 sticky top-0 z-10">
      <div className="w-60 shrink-0 px-4 py-2 text-xs font-medium text-muted-foreground border-r">
        Room
      </div>
      {dates.map((date) => {
        const dateStr = toDateStr(date)
        const isToday = dateStr === today
        return (
          <div
            key={dateStr}
            style={{ width: cellWidth, minWidth: cellWidth }}
            className={cn(
              "shrink-0 flex flex-col items-center justify-center py-2 border-r text-xs select-none",
              isToday ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"
            )}
          >
            <span>{DAY_NAMES[date.getDay()]}</span>
            <span className={cn("text-sm font-medium", isToday && "text-primary")}>{date.getDate()}</span>
          </div>
        )
      })}
    </div>
  )
}
