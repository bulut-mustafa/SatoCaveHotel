"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { DayPicker, getDefaultClassNames, type DateRange } from "react-day-picker"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"
import { buttonVariants, Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"
import { setPriceOverride, deletePriceOverride, setRangePriceOverrides } from "@/actions/availability"
import { toDateStr } from "@/lib/date-utils"
import { cn } from "@/lib/utils"
import type { PriceOverride } from "@/types/booking"

interface Props {
  roomId: string
  basePrice: number
  priceOverrides: PriceOverride[]
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  })
}

export function PricingTab({ roomId, basePrice, priceOverrides }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState<"single" | "range">("single")

  // Single mode state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [singlePrice, setSinglePrice] = useState("")
  const [singleLoading, setSingleLoading] = useState(false)

  // Range mode state
  const [range, setRange] = useState<DateRange | undefined>()
  const [rangePrice, setRangePrice] = useState("")
  const [rangeLoading, setRangeLoading] = useState(false)

  const overrideMap = Object.fromEntries(priceOverrides.map((p) => [p.date, p.price]))
  const defaultClassNames = getDefaultClassNames()

  const handleDayClick = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      const existing = overrideMap[toDateStr(date)]
      setSinglePrice(existing ? String(existing) : String(basePrice))
    }
  }

  const handleSingleSet = async () => {
    if (!selectedDate || !singlePrice) return
    setSingleLoading(true)
    await setPriceOverride(roomId, toDateStr(selectedDate), Number(singlePrice))
    setSingleLoading(false)
    setSelectedDate(undefined)
    startTransition(() => router.refresh())
  }

  const handleRangeSet = async () => {
    if (!range?.from || !range?.to || !rangePrice) return
    setRangeLoading(true)
    await setRangePriceOverrides(roomId, toDateStr(range.from), toDateStr(range.to), Number(rangePrice))
    setRangeLoading(false)
    setRange(undefined)
    setRangePrice("")
    startTransition(() => router.refresh())
  }

  const handleDelete = async (date: string) => {
    await deletePriceOverride(roomId, date)
    startTransition(() => router.refresh())
  }

  const sharedClassNames = {
    root: cn("w-fit", defaultClassNames.root),
    months: cn("flex gap-4 flex-col md:flex-row relative", defaultClassNames.months),
    month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
    nav: cn("flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between", defaultClassNames.nav),
    button_previous: cn(buttonVariants({ variant: "ghost" }), "size-8 aria-disabled:opacity-50 p-0 select-none", defaultClassNames.button_previous),
    button_next: cn(buttonVariants({ variant: "ghost" }), "size-8 aria-disabled:opacity-50 p-0 select-none", defaultClassNames.button_next),
    month_caption: cn("flex items-center justify-center h-8 w-full px-8", defaultClassNames.month_caption),
    caption_label: cn("select-none font-medium text-sm", defaultClassNames.caption_label),
    table: "w-full border-collapse",
    weekdays: cn("flex", defaultClassNames.weekdays),
    weekday: cn("text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none", defaultClassNames.weekday),
    week: cn("flex w-full mt-2", defaultClassNames.week),
    day: cn("relative w-full h-full p-0 text-center group/day aspect-square select-none", defaultClassNames.day),
    today: cn("bg-accent text-accent-foreground rounded-md", defaultClassNames.today),
    outside: cn("text-muted-foreground opacity-50", defaultClassNames.outside),
    hidden: cn("invisible", defaultClassNames.hidden),
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-medium mb-1">Price Overrides</h3>
            <p className="text-sm text-muted-foreground">
              Base price: €{basePrice}/night.
              {mode === "single" ? " Click a date to set a custom price." : " Select a range to set price for multiple nights at once."}
            </p>
          </div>
          {/* Mode toggle */}
          <div className="flex rounded-lg border overflow-hidden shrink-0 ml-4">
            <button
              onClick={() => { setMode("single"); setRange(undefined) }}
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors", mode === "single" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
            >
              Single date
            </button>
            <button
              onClick={() => { setMode("range"); setSelectedDate(undefined) }}
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors border-l", mode === "range" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
            >
              Date range
            </button>
          </div>
        </div>

        {mode === "single" && (
          <>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDayClick}
              showOutsideDays={false}
              numberOfMonths={2}
              className="bg-background p-3"
              classNames={{ ...sharedClassNames, selected: "bg-primary text-primary-foreground rounded-md" }}
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
                  const override = overrideMap[dateStr]
                  return (
                    <Button variant="ghost" size="icon"
                      data-selected-single={modifiers.selected}
                      className={cn(
                        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
                        "flex aspect-square size-auto w-full min-w-8 flex-col gap-0.5 leading-none font-normal",
                        override && "ring-1 ring-primary ring-inset",
                        className
                      )}
                      {...props}
                    >
                      <span className="text-xs">{day.date.getDate()}</span>
                      {override && <span className="text-[9px] opacity-70 leading-none text-primary">€{override}</span>}
                    </Button>
                  )
                },
              }}
            />
            {selectedDate && (
              <div className="mt-4 border rounded-lg p-4 max-w-xs space-y-3">
                <p className="text-sm font-medium">{formatDate(toDateStr(selectedDate))}</p>
                <div className="flex items-end gap-2">
                  <div className="space-y-1 flex-1">
                    <Label>Price (€/night)</Label>
                    <Input type="number" value={singlePrice} onChange={(e) => setSinglePrice(e.target.value)} disabled={singleLoading} />
                  </div>
                  <Button size="sm" onClick={handleSingleSet} disabled={singleLoading || !singlePrice}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedDate(undefined)}>Cancel</Button>
                </div>
              </div>
            )}
          </>
        )}

        {mode === "range" && (
          <>
            <DayPicker
              mode="range"
              selected={range}
              onSelect={(r) => {
                setRange(r)
                if (r?.from && r?.to && toDateStr(r.from) !== toDateStr(r.to) && !rangePrice) {
                  setRangePrice(String(basePrice))
                }
              }}
              showOutsideDays={false}
              numberOfMonths={2}
              className="bg-background p-3"
              classNames={{
                ...sharedClassNames,
                range_start: cn("rounded-l-md bg-accent", defaultClassNames.range_start),
                range_middle: cn("rounded-none", defaultClassNames.range_middle),
                range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
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
                  const override = overrideMap[dateStr]
                  return (
                    <Button variant="ghost" size="icon"
                      data-range-start={modifiers.range_start}
                      data-range-end={modifiers.range_end}
                      data-range-middle={modifiers.range_middle}
                      className={cn(
                        "data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground",
                        "data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
                        "data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
                        "data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md",
                        "flex aspect-square size-auto w-full min-w-8 flex-col gap-0.5 leading-none font-normal",
                        override && "ring-1 ring-primary ring-inset",
                        className
                      )}
                      {...props}
                    >
                      <span className="text-xs">{day.date.getDate()}</span>
                      {override && <span className="text-[9px] opacity-70 leading-none text-primary">€{override}</span>}
                    </Button>
                  )
                },
              }}
            />
            {range?.from && range?.to && toDateStr(range.from) !== toDateStr(range.to) && (
              <div className="mt-4 border rounded-lg p-4 max-w-sm space-y-3">
                <p className="text-sm font-medium">
                  {formatDate(toDateStr(range.from))} → {formatDate(toDateStr(range.to))}
                </p>
                <div className="flex items-end gap-2">
                  <div className="space-y-1 flex-1">
                    <Label>Price for all nights (€/night)</Label>
                    <Input type="number" value={rangePrice} onChange={(e) => setRangePrice(e.target.value)} disabled={rangeLoading} />
                  </div>
                  <Button size="sm" onClick={handleRangeSet} disabled={rangeLoading || !rangePrice}>Apply</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setRange(undefined); setRangePrice("") }}>Cancel</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {priceOverrides.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">Active Overrides ({priceOverrides.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {priceOverrides.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-md bg-muted text-sm">
                <span>
                  <span className="font-medium">{formatDate(p.date)}</span>
                  <span className="text-muted-foreground ml-2">→ €{Number(p.price).toFixed(2)}</span>
                  <span className="text-muted-foreground ml-1">(base: €{basePrice})</span>
                </span>
                <button
                  onClick={() => handleDelete(p.date)}
                  disabled={isPending}
                  className="p-1 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
