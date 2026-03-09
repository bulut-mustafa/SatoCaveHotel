"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BedDouble, MapPin, Info, Phone, LogOut, LayoutDashboard, CalendarCheck, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  badge?: number
}

const staticNavItems = [
  { href: "/admin", label: "Dashboard", icon: Home, exact: true },
  { href: "/admin/rooms", label: "Rooms", icon: BedDouble },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/activities", label: "Activities", icon: MapPin },
  { href: "/admin/about", label: "About", icon: Info },
  { href: "/admin/contact", label: "Contact", icon: Phone },
]

interface Props {
  pendingCount?: number
}

export function AdminSidebar({ pendingCount = 0 }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  const navItems: (typeof staticNavItems[0] & { badge?: number })[] = staticNavItems.map((item) =>
    item.href === "/admin/bookings" ? { ...item, badge: pendingCount } : item
  )

  return (
    <aside className="w-60 shrink-0 border-r bg-card flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-1">
          <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold">Sato Admin</span>
        </div>
        <p className="text-xs text-muted-foreground pl-7">Cave Hotel Dashboard</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact, badge }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge != null && badge > 0 && (
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none",
                  active ? "bg-white/30 text-white" : "bg-red-500 text-white"
                )}>
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
