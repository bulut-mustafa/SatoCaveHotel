import Link from "next/link"
import { CalendarCheck, TrendingUp, BedDouble, Clock, ArrowRight } from "lucide-react"
import { getRooms } from "@/lib/content"
import { getBookings, getBookingStats } from "@/actions/bookings"
import { PendingBookings } from "./components/pending-bookings"

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string; sub?: string; icon: React.ElementType; color: string
}) {
  return (
    <div className="bg-card border rounded-xl p-5 flex items-start gap-4">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none mb-1">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default async function AdminDashboardPage() {
  const rooms = await getRooms("en").catch(() => [])
  const [stats, pendingBookings, recentBookings] = await Promise.all([
    getBookingStats(rooms.length).catch(() => ({
      pending_count: 0, this_month_bookings: 0, this_month_revenue: 0, occupancy_pct: 0,
    })),
    getBookings({ status: "pending" }).catch(() => []),
    getBookings({ status: "accepted" }).catch(() => []),
  ])

  const now = new Date()
  const monthName = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
  const recent = recentBookings.slice(0, 5)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">{monthName}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending bookings"
          value={String(stats.pending_count)}
          sub={stats.pending_count > 0 ? "Need your action" : "All caught up"}
          icon={Clock}
          color={stats.pending_count > 0 ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}
        />
        <StatCard
          label="Bookings this month"
          value={String(stats.this_month_bookings)}
          icon={CalendarCheck}
          color="bg-blue-100 text-blue-700"
        />
        <StatCard
          label="Revenue this month"
          value={`€${stats.this_month_revenue.toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          sub="Accepted bookings only"
          icon={TrendingUp}
          color="bg-green-100 text-green-700"
        />
        <StatCard
          label="Occupancy this month"
          value={`${stats.occupancy_pct}%`}
          sub={`${rooms.length} rooms`}
          icon={BedDouble}
          color="bg-purple-100 text-purple-700"
        />
      </div>

      {/* Pending bookings */}
      <div className="bg-card border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Pending Bookings</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Click ✓ to accept or ✗ to reject</p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <PendingBookings bookings={pendingBookings} />
      </div>

      {/* Recent accepted bookings */}
      {recent.length > 0 && (
        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold mb-4">Recent Confirmed Bookings</h2>
          <div className="space-y-2">
            {recent.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm px-3 py-2.5 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                  <span className="font-medium">{b.guest_name}</span>
                  <span className="text-muted-foreground hidden sm:inline">·</span>
                  <span className="text-muted-foreground hidden sm:inline truncate">{b.room_id}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-muted-foreground ml-4">
                  <span className="hidden sm:inline">{fmtDate(b.check_in)} → {fmtDate(b.check_out)}</span>
                  <span className="font-semibold text-foreground">€{Number(b.total_price).toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
