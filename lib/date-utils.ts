import { format, eachDayOfInterval, differenceInCalendarDays } from "date-fns"

export function toDateStr(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

/** Returns all date strings from start up to (not including) end */
export function expandDateRange(start: string, end: string): string[] {
  const s = new Date(start + "T00:00:00")
  const e = new Date(end + "T00:00:00")
  if (s >= e) return []
  const days = eachDayOfInterval({ start: s, end: new Date(e.getTime() - 86400000) })
  return days.map((d) => toDateStr(d))
}

/** Number of nights between check_in and check_out */
export function nightCount(checkIn: string, checkOut: string): number {
  return differenceInCalendarDays(
    new Date(checkOut + "T00:00:00"),
    new Date(checkIn + "T00:00:00")
  )
}
