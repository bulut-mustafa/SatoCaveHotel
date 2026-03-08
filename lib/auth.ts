// Uses Web Crypto API — works in Edge Runtime and Node.js 18+

export const AUTH_COOKIE = "admin_session"
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function getSecret(): string {
  return process.env.ADMIN_SECRET || "fallback-secret-change-in-production"
}

async function importKey(usage: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usage
  )
}

export async function signToken(payload: string): Promise<string> {
  const key = await importKey(["sign"])
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  return `${payload}.${hex}`
}

export async function verifyToken(token: string): Promise<boolean> {
  const lastDot = token.lastIndexOf(".")
  if (lastDot === -1) return false
  const payload = token.slice(0, lastDot)
  const hex = token.slice(lastDot + 1)
  try {
    const sigBytes = new Uint8Array(
      (hex.match(/.{2}/g) ?? []).map((b) => parseInt(b, 16))
    )
    const key = await importKey(["verify"])
    return await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(payload)
    )
  } catch {
    return false
  }
}
