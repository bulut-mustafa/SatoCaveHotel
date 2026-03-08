import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { i18n } from "./i18n-config"
import { match as matchLocale } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"
import { verifyToken, AUTH_COOKIE } from "./lib/auth"

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))
  const locales: string[] = [...i18n.locales]
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()
  try {
    return matchLocale(languages, locales, i18n.defaultLocale)
  } catch {
    return i18n.defaultLocale
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Allow API routes and login page through (skip auth + i18n)
  if (pathname.startsWith("/api/") || pathname.startsWith("/admin/login")) {
    return NextResponse.next()
  }

  // 2. Admin auth guard
  if (pathname.startsWith("/admin")) {
    const sessionToken = request.cookies.get(AUTH_COOKIE)?.value
    const valid = sessionToken ? await verifyToken(sessionToken) : false
    if (!valid) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
    return NextResponse.next()
  }

  // 3. i18n locale detection/redirect
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
        request.url
      )
    )
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|images|videos|favicon.ico|Sato-logo.jpg|Sato-logo-transparent.png).*)",
  ],
}
