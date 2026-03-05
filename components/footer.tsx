"use client"

import Link from "next/link"
import { MapPin, Phone, Mail } from "lucide-react"

export function Footer({ dict, lang }: { dict: any; lang: string }) {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-wider">
                SATO
              </span>
              <span className="text-[10px] tracking-[0.3em] text-primary-foreground/70 uppercase">
                Cave Hotel
              </span>
            </div>
            <p className="text-sm leading-relaxed text-primary-foreground/70">
              {dict.description}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase">
              {dict.quick_links}
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                href={`/${lang}`}
                className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
              >
                {dict.nav_home || "Home"}
              </Link>
              <Link
                href={`/${lang}/rooms`}
                className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
              >
                {dict.nav_rooms || "Rooms"}
              </Link>
              <a
                href={`/${lang}#reviews`}
                className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
              >
                {dict.nav_reviews || "Reviews"}
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase">
              {dict.contact}
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Orta Mah, Konak Sk. No:7, 50180 Göreme/Nevşehir</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+90 555 123 45 67</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4 shrink-0" />
                <span>satocavehotel@gmail.com</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase">
              {dict.newsletter}
            </h3>
            <p className="text-sm text-primary-foreground/70">
              {dict.newsletter_desc}
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder={dict.placeholder}
                className="flex-1 rounded-full border border-primary-foreground/20 bg-transparent px-4 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
              >
                {dict.join}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/10 pt-8">
          <p className="text-center text-xs text-primary-foreground/50">
            {new Date().getFullYear()} {dict.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
