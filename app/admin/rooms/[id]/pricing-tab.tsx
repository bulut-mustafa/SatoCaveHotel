"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { DayPicker, getDefaultClassNames } from "react-day-picker"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"
import { buttonVariants, Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Trash2 } from "lucide-react"
import { setPriceOverride, deletePriceOverride } from "@/actions/availability"
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const overrideMap = Object.fromEntries(priceOverrides.map((p) => [p.date, p.price]))
  const defaultClassNames = getDefaultClassNames()

  const handleDayClick = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      const existing = overrideMap[toDateStr(date)]
      setPrice(existing ? String(existing) : String(basePrice))
      setPopoverOpen(true)
    }
  }

  const handleSet = async () => {
    if (!selectedDate || !price) return
    setLoading(true)
    await setPriceOverride(roomId, toDateStr(selectedDate), Number(price))
    setLoading(false)
    setPopoverOpen(false)
    setSelectedDate(undefined)
    startTransition(() => router.refresh())
  }

  const handleDelete = async (date: string) => {
    await deletePriceOverride(roomId, date)
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-1">Price Overrides</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Base price: €{basePrice}/night. Click a date to set a custom price.
        </p>

        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={handleDayClick}
          showOutsideDays={false}
          numberOfMonths={2}
          className="bg-background p-3"
          classNames={{
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
            selected: "bg-primary text-primary-foreground rounded-md",
            outside: cn("text-muted-foreground opacity-50", defaultClassNames.outside),
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
              const override = overrideMap[dateStr]
              return (
                <Button
                  variant="ghost"
                  size="icon"
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
                  {override && (
                    <span className="text-[9px] opacity-70 leading-none text-primary">€{override}</span>
                  )}
                </Button>
              )
            },
          }}
        />

        {/* Popover for editing price */}
        {selectedDate && popoverOpen && (
          <div className="mt-4 border rounded-lg p-4 max-w-xs space-y-3">
            <p className="text-sm font-medium">{formatDate(toDateStr(selectedDate))}</p>
            <div className="flex items-end gap-2">
              <div className="space-y-1 flex-1">
                <Label>Price (€/night)</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button size="sm" onClick={handleSet} disabled={loading}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setPopoverOpen(false); setSelectedDate(undefined) }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {priceOverrides.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">Active Overrides</h3>
          <div className="space-y-2">
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
