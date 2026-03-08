import { NextRequest, NextResponse } from "next/server"
import { signToken, AUTH_COOKIE, COOKIE_MAX_AGE } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }

  const token = await signToken(`admin:${Date.now()}`)

  const response = NextResponse.json({ success: true })
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })

  return response
}
