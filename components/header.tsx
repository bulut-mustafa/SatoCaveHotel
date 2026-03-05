"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, ArrowUpRight } from "lucide-react"

export function Header({
  dict,
  lang,
}: {
  dict: any
  lang: string
}) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
        }`}
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* LOGO (LEFT) */}
        <Link href={`/${lang}`} className="flex flex-col z-50">
          <span className="font-serif text-xl font-medium tracking-wide text-foreground">
            {dict.hotel_name}
          </span>
          <span className="text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
            {dict.hotel_subtitle}
          </span>
        </Link>

        {/* PILL NAVIGATION (CENTER) */}
        <div className="hidden md:flex items-center rounded-full border border-border/60 bg-background/50 backdrop-blur-md px-2 py-1.5 shadow-sm">
          <Link
            href={`/${lang}`}
            className="rounded-full bg-foreground px-5 py-2 text-xs font-semibold tracking-wide text-background transition-colors"
          >
            {dict.nav_home}
          </Link>
          <Link
            href={`/${lang}/rooms`}
            className="rounded-full px-5 py-2 text-xs font-medium tracking-wide text-foreground/80 transition-colors hover:text-foreground hover:bg-muted/50"
          >
            {dict.nav_rooms}
          </Link>
          <a
            href={`/${lang}#breakfast`}
            className="rounded-full px-5 py-2 text-xs font-medium tracking-wide text-foreground/80 transition-colors hover:text-foreground hover:bg-muted/50"
          >
            {dict.nav_breakfast}
          </a>
          <a
            href={`/${lang}#reviews`}
            className="rounded-full px-5 py-2 text-xs font-medium tracking-wide text-foreground/80 transition-colors hover:text-foreground hover:bg-muted/50"
          >
            {dict.nav_reviews}
          </a>
        </div>

        {/* BOOKING / LANGUAGE / MOBILE (RIGHT) */}
        <div className="flex items-center gap-3 z-50">
          <Link
            href={lang === "tr" ? "/en" : "/tr"}
            className="hidden md:flex items-center justify-center rounded-full border border-border/60 h-10 w-10 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            aria-label="Switch language"
          >
            {lang === "tr" ? "EN" : "TR"}
          </Link>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background text-foreground"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg md:hidden">
          <div className="flex flex-col gap-2 px-6 py-6">
            <Link
              href={`/${lang}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {dict.nav_home}
            </Link>
            <Link
              href={`/${lang}/rooms`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {dict.nav_rooms}
            </Link>
            <a
              href={`/${lang}#breakfast`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {dict.nav_breakfast}
            </a>
            <a
              href={`/${lang}#reviews`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {dict.nav_reviews}
            </a>

            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
              <Link
                href={lang === "tr" ? "/en" : "/tr"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-full border border-border/60 py-3 text-sm font-semibold text-foreground"
              >
                Switch to {lang === "tr" ? "English" : "Türkçe"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
