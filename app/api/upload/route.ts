import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { verifyToken, AUTH_COOKIE } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get(AUTH_COOKIE)?.value
  if (!sessionToken || !(await verifyToken(sessionToken))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage not configured" },
      { status: 503 }
    )
  }

  const blob = await put(`rooms/${Date.now()}-${file.name}`, file, {
    access: "public",
  })

  return NextResponse.json({ url: blob.url })
}
