"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ArrowUpRight } from "lucide-react"
import { usePathname } from "next/navigation"

export function Header({
  dict,
  lang,
}: {
  dict: any
  lang: string
}) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isHome = pathname === `/${lang}` || pathname === `/`
  const otherLang = lang === "tr" ? "en" : "tr"
  const switchHref = `/${otherLang}${pathname.replace(`/${lang}`, "")}`
  const headerNeedsLightText = isHome && !isScrolled

  // Returns pill-active or pill-inactive classes for desktop nav
  const navClass = (href: string, exact = false) => {
    const active = exact
      ? pathname === href
      : pathname.startsWith(href) && href !== `/${lang}` && href !== `/`
    const homeActive = (href === `/${lang}` || href === `/`) && isHome
    return (active || homeActive)
      ? "rounded-full bg-foreground px-5 py-2 text-xs font-semibold tracking-wide text-background transition-colors"
      : "rounded-full px-5 py-2 text-xs font-medium tracking-wide text-foreground/80 transition-colors hover:text-foreground hover:bg-muted/50"
  }

  // Returns active or inactive classes for mobile menu items
  const mobileNavClass = (href: string) => {
    const active = href === `/${lang}` ? isHome : pathname.startsWith(href)
    return active
      ? "rounded-lg px-4 py-3 text-sm font-semibold text-foreground bg-muted transition-colors"
      : "rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
  }

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
        <Link href={`/${lang}`} className="flex items-center gap-4 z-50 shrink-0">
          <Image
            src="/Sato-logo-transparent.png"
            alt={dict.hotel_name}
            width={120}
            height={80}
            className={`object-contain h-14 sm:h-16 w-auto transition-all duration-300 ${headerNeedsLightText ? "brightness-0 invert" : ""}`}
            priority
          />
          <div className="flex flex-col justify-center">
            <span className={`font-serif text-xl sm:text-2xl font-bold tracking-widest leading-none mb-1 transition-colors duration-300 uppercase ${headerNeedsLightText ? 'text-white' : 'text-foreground'}`}>
              SATO
            </span>
            <span className={`text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase transition-colors duration-300 ${headerNeedsLightText ? 'text-white/80' : 'text-muted-foreground'}`}>
              Cave Hotel
            </span>
          </div>
        </Link>

        {/* PILL NAVIGATION (CENTER) */}
        <div className="hidden md:flex items-center rounded-full border border-border/60 bg-background/50 backdrop-blur-md px-2 py-1.5 shadow-sm">
          <Link href={`/${lang}`} className={navClass(`/${lang}`, true)}>
            {dict.nav_home}
          </Link>
          <Link href={`/${lang}/rooms`} className={navClass(`/${lang}/rooms`)}>
            {dict.nav_rooms}
          </Link>
          <Link href={`/${lang}/activities`} className={navClass(`/${lang}/activities`)}>
            {dict.nav_activities}
          </Link>
          <a href={`/${lang}#reviews`} className={navClass(`/${lang}#reviews`)}>
            {dict.nav_reviews}
          </a>
        </div>

        {/* BOOKING / LANGUAGE / MOBILE (RIGHT) */}
        <div className="flex items-center gap-3 z-50">
          <Link
            href={switchHref}
            className={`hidden md:flex items-center justify-center rounded-full border h-10 w-10 text-xs font-semibold transition-colors duration-300 ${headerNeedsLightText
              ? "border-white/40 text-white hover:bg-white/20"
              : "border-border/60 text-foreground hover:bg-muted"
              }`}
            aria-label="Switch language"
          >
            {otherLang.toUpperCase()}
          </Link>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`flex md:hidden h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300 ${headerNeedsLightText && !isMobileMenuOpen
              ? "border-white/40 bg-transparent text-white focus:bg-white/20"
              : "border-border/60 bg-background text-foreground"
              }`}
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
              className={mobileNavClass(`/${lang}`)}
            >
              {dict.nav_home}
            </Link>
            <Link
              href={`/${lang}/rooms`}
              onClick={() => setIsMobileMenuOpen(false)}
              className={mobileNavClass(`/${lang}/rooms`)}
            >
              {dict.nav_rooms}
            </Link>
            <Link
              href={`/${lang}/activities`}
              onClick={() => setIsMobileMenuOpen(false)}
              className={mobileNavClass(`/${lang}/activities`)}
            >
              {dict.nav_activities}
            </Link>
            <a
              href={`/${lang}#reviews`}
              onClick={() => setIsMobileMenuOpen(false)}
              className={mobileNavClass(`/${lang}#reviews`)}
            >
              {dict.nav_reviews}
            </a>

            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
              <Link
                href={switchHref}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-full border border-border/60 py-3 text-sm font-semibold text-foreground"
              >
                Switch to {otherLang === "tr" ? "Türkçe" : "English"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
