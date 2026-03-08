"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BedDouble, MapPin, Info, Phone, LogOut, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin/rooms", label: "Rooms", icon: BedDouble },
  { href: "/admin/activities", label: "Activities", icon: MapPin },
  { href: "/admin/about", label: "About", icon: Info },
  { href: "/admin/contact", label: "Contact", icon: Phone },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

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
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname.startsWith(href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
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
