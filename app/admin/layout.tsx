import type { Metadata } from "next"
import { DM_Sans, Playfair_Display } from "next/font/google"
import "../globals.css"
import { AdminSidebar } from "./components/sidebar"
import { getBookings } from "@/actions/bookings"

const _dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" })
const _playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata: Metadata = {
  title: "Sato Admin",
  robots: "noindex,nofollow",
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pending = await getBookings({ status: "pending" }).catch(() => [])
  const pendingCount = pending.length

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen bg-muted/30">
          <AdminSidebar pendingCount={pendingCount} />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}
