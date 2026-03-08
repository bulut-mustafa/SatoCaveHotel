"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Mail, Copy, Globe } from "lucide-react"
import { FaInstagram, FaTripadvisor } from "react-icons/fa"
import type { ContactInfo, ContactField } from "@/types/content"
import { getDefaultContact } from "@/lib/default-contact"

interface FooterProps {
  dict: any
  lang: string
  contact?: ContactInfo
}

const CONTACT_ICONS: Record<ContactField["type"], React.ElementType> = {
  address: MapPin,
  phone: Phone,
  email: Mail,
  social: Globe,
  custom: Globe,
}

function SocialIcon({ href }: { href: string }) {
  if (href.includes("instagram")) return <FaInstagram className="h-6 w-6" />
  if (href.includes("tripadvisor")) return <FaTripadvisor className="h-6 w-6" />
  return <Globe className="h-6 w-6" />
}

export function Footer({ dict, lang, contact }: FooterProps) {
  const c = contact ?? getDefaultContact()

  const contactFields = c.fields.filter((f) => f.type !== "social")
  const socialFields = c.fields.filter((f) => f.type === "social")

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo + description */}
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

          {/* Quick links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase">
              {dict.quick_links}
            </h3>
            <div className="flex flex-col gap-2">
              <Link href={`/${lang}`} className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground">
                {dict.nav_home || "Home"}
              </Link>
              <Link href={`/${lang}/rooms`} className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground">
                {dict.nav_rooms || "Rooms"}
              </Link>
              <a href={`/${lang}#reviews`} className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground">
                {dict.nav_reviews || "Reviews"}
              </a>
            </div>
          </div>

          {/* Contact fields */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase">
              {dict.contact}
            </h3>
            <div className="flex flex-col gap-3">
              {contactFields.map((field) => {
                const Icon = CONTACT_ICONS[field.type]

                if (field.type === "email") {
                  return (
                    <div key={field.id} className="group flex items-center gap-2 text-sm text-primary-foreground/70">
                      <Mail className="h-4 w-4 shrink-0" />
                      <a
                        href={`mailto:${field.value}`}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      >
                        {field.value}
                      </a>
                      <button
                        onClick={() => navigator.clipboard.writeText(field.value)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                }

                if (field.href) {
                  return (
                    <a
                      key={field.id}
                      href={field.type === "phone" ? `tel:${field.value.replace(/\s/g, "")}` : field.href}
                      target={field.type === "address" ? "_blank" : undefined}
                      rel={field.type === "address" ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{field.value}</span>
                    </a>
                  )
                }

                return (
                  <div key={field.id} className="flex items-center gap-2 text-sm text-primary-foreground/70">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{field.value}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Social */}
          {socialFields.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold tracking-wider uppercase">Social</h3>
              <div className="flex gap-4">
                {socialFields.map((field) => (
                  <a
                    key={field.id}
                    href={field.href || field.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-foreground/70 hover:text-primary-foreground transition"
                    title={field.label}
                  >
                    <SocialIcon href={field.href || field.value} />
                  </a>
                ))}
              </div>
            </div>
          )}
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
