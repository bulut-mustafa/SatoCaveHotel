"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Mail, Copy } from "lucide-react"
import { FaInstagram, FaTripadvisor } from "react-icons/fa"

export function Footer({ dict, lang }: { dict: any; lang: string }) {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href={`/${lang}`} className="flex flex-col">
              <Image
                src="/Sato-logo-transparent.png"
                alt="Sato Cave Hotel Logo"
                width={150}
                height={75}
                className="object-contain h-16 w-auto brightness-0 invert"
                priority
              />
            </Link>
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

              <a
                href="https://maps.app.goo.gl/EzbD57mNWvfBqnCN8"
                target="_blank"
                className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition"
              >
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Orta Mah, Konak Sk. No:9, 50180 Göreme/Nevşehir</span>
              </a>

              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+90 546 500 87 75</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+90 554 205 00 08</span>
              </div>

              {/* Email with hover + copy */}
              <div className="group flex items-center gap-2 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4 shrink-0" />

                <a
                  href="mailto:satocavehotel@gmail.com"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                >
                  satocavehotel@gmail.com
                </a>

                <button
                  onClick={() => navigator.clipboard.writeText("satocavehotel@gmail.com")}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase">
              Social
            </h3>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/satocave"
                target="_blank"
                className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition"
              >
                <FaInstagram className="h-6 w-6" />
              </a>
              <a
                href="https://www.tripadvisor.com.tr/Hotel_Review-g297983-d645745-Reviews-Sato_Cave_Hotel-Goreme_Cappadocia.html?m=19905"
                target="_blank"
                className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition"
              >
                <FaTripadvisor className="h-6 w-6" />
              </a>
            </div>

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
