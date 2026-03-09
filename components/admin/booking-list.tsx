"use client"

import { useState, useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Search, Download, Check, XCircle, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { acceptBooking, rejectBooking, cancelBooking } from "@/actions/bookings"
import { nightCount } from "@/lib/date-utils"
import type { Booking } from "@/types/booking"
import type { FullRoom } from "@/types/content"
import { cn } from "@/lib/utils"

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  accepted: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function exportCSV(bookings: Booking[]) {
  const headers = ["ID", "Room", "Guest Name", "Email", "Phone", "Guests", "Check-in", "Check-out", "Nights", "Total (€)", "Status", "Special Requests", "Admin Notes", "Created"]
  const rows = bookings.map((b) => [
    b.id,
    b.room_id,
    b.guest_name,
    b.guest_email,
    b.guest_phone,
    b.num_guests,
    b.check_in,
    b.check_out,
    nightCount(b.check_in, b.check_out),
    Number(b.total_price).toFixed(2),
    b.status,
    b.special_requests ?? "",
    b.admin_notes ?? "",
    b.created_at?.slice(0, 10) ?? "",
  ])
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const STATUS_TABS = ["all", "pending", "accepted", "rejected", "cancelled"] as const

interface Props {
  bookings: Booking[]
  rooms: FullRoom[]
}

export function BookingList({ bookings, rooms }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_TABS[number]>("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const roomNames = useMemo(() => Object.fromEntries(rooms.map((r) => [r.id, r.name])), [rooms])

  const filtered = useMemo(() => {
    let list = bookings
    if (statusFilter !== "all") list = list.filter((b) => b.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((b) =>
        b.guest_name.toLowerCase().includes(q) ||
        b.guest_email.toLowerCase().includes(q) ||
        b.room_id.toLowerCase().includes(q) ||
        b.guest_phone.includes(q)
      )
    }
    return list
  }, [bookings, statusFilter, search])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length }
    for (const b of bookings) c[b.status] = (c[b.status] ?? 0) + 1
    return c
  }, [bookings])

  const handleAction = async (id: string, action: "accept" | "reject" | "cancel") => {
    const msg = action === "cancel" ? "Cancel this booking?" : null
    if (msg && !confirm(msg)) return
    setActionLoading(id + action)
    if (action === "accept") await acceptBooking(id)
    else if (action === "reject") await rejectBooking(id)
    else await cancelBooking(id)
    setActionLoading(null)
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b bg-background">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guest, email, room…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => exportCSV(filtered)}>
          <Download className="h-4 w-4 mr-1.5" />
          Export CSV
        </Button>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} booking{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 px-4 py-2 border-b bg-background overflow-x-auto">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors whitespace-nowrap",
              statusFilter === s ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
            )}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            {counts[s] != null && (
              <span className={cn("ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]",
                statusFilter === s ? "bg-white/25" : "bg-muted"
              )}>
                {counts[s] ?? 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
            No bookings found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 sticky top-0">
              <tr>
                {["Room", "Guest", "Dates", "Nights", "Total", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((b) => {
                const nights = nightCount(b.check_in, b.check_out)
                return (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium leading-none">{roomNames[b.room_id] ?? b.room_id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{b.guest_name}</p>
                      <p className="text-xs text-muted-foreground">{b.guest_email}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p>{fmtDate(b.check_in)}</p>
                      <p className="text-xs text-muted-foreground">{fmtDate(b.check_out)}</p>
                    </td>
                    <td className="px-4 py-3 text-center">{nights}</td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">€{Number(b.total_price).toFixed(0)}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn("text-xs border capitalize", STATUS_COLORS[b.status])}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {b.status === "pending" && (
                          <>
                            <Button size="sm" className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white"
                              disabled={actionLoading === b.id + "accept"}
                              onClick={() => handleAction(b.id, "accept")}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive" className="h-7 px-2"
                              disabled={actionLoading === b.id + "reject"}
                              onClick={() => handleAction(b.id, "reject")}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {b.status === "accepted" && (
                          <Button size="sm" variant="outline" className="h-7 px-2 text-muted-foreground hover:text-destructive"
                            disabled={actionLoading === b.id + "cancel"}
                            onClick={() => handleAction(b.id, "cancel")}
                          >
                            <Ban className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
