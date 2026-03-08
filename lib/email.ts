import { Resend } from "resend"
import type { Booking } from "@/types/booking"
import { getContact } from "./content"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@satocavehotel.com"
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ""

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function nights(checkIn: string, checkOut: string) {
  const ms = new Date(checkOut + "T00:00:00").getTime() - new Date(checkIn + "T00:00:00").getTime()
  return Math.round(ms / 86400000)
}

async function getWhatsApp(): Promise<string> {
  try {
    const contact = await getContact()
    const field = contact.fields?.find((f) => f.type === "phone")
    return field?.value ?? ""
  } catch {
    return ""
  }
}

function bookingTable(b: Booking, whatsapp: string) {
  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:8px;border:1px solid #eee;color:#666">Room</td><td style="padding:8px;border:1px solid #eee">${b.room_id}</td></tr>
      <tr><td style="padding:8px;border:1px solid #eee;color:#666">Check-in</td><td style="padding:8px;border:1px solid #eee">${formatDate(b.check_in)}</td></tr>
      <tr><td style="padding:8px;border:1px solid #eee;color:#666">Check-out</td><td style="padding:8px;border:1px solid #eee">${formatDate(b.check_out)}</td></tr>
      <tr><td style="padding:8px;border:1px solid #eee;color:#666">Nights</td><td style="padding:8px;border:1px solid #eee">${nights(b.check_in, b.check_out)}</td></tr>
      <tr><td style="padding:8px;border:1px solid #eee;color:#666">Guests</td><td style="padding:8px;border:1px solid #eee">${b.num_guests}</td></tr>
      <tr><td style="padding:8px;border:1px solid #eee;color:#666">Total</td><td style="padding:8px;border:1px solid #eee"><strong>€${Number(b.total_price).toFixed(2)}</strong></td></tr>
      ${whatsapp ? `<tr><td style="padding:8px;border:1px solid #eee;color:#666">Contact</td><td style="padding:8px;border:1px solid #eee">WhatsApp: ${whatsapp}</td></tr>` : ""}
    </table>
  `
}

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping email to", to)
    return
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html })
  } catch (err) {
    console.error("[email] Failed to send:", err)
  }
}

export async function sendBookingReceived(booking: Booking) {
  const wa = await getWhatsApp()
  const html = `
    <h2 style="font-family:serif;color:#1a1a1a">Booking Request Received</h2>
    <p>Dear ${booking.guest_name},</p>
    <p>Thank you for your booking request at <strong>Sato Cave Hotel</strong>. We will review your request and contact you within 24 hours to confirm your reservation.</p>
    ${bookingTable(booking, wa)}
    ${booking.special_requests ? `<p><strong>Special requests:</strong> ${booking.special_requests}</p>` : ""}
    <p style="color:#666;font-size:14px">If you have any questions, please contact us via WhatsApp${wa ? `: ${wa}` : ""}.</p>
    <p>Warm regards,<br>Sato Cave Hotel — Göreme, Cappadocia</p>
  `
  await send(booking.guest_email, "Booking Request Received — Sato Cave Hotel", html)
}

export async function sendAdminNewBooking(booking: Booking) {
  if (!ADMIN_EMAIL) return
  const html = `
    <h2 style="font-family:serif;color:#1a1a1a">New Booking Request</h2>
    <p>A new booking request has been received.</p>
    <p><strong>Guest:</strong> ${booking.guest_name} (${booking.guest_email}, ${booking.guest_phone})</p>
    ${bookingTable(booking, "")}
    ${booking.special_requests ? `<p><strong>Special requests:</strong> ${booking.special_requests}</p>` : ""}
    <p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/bookings">View in Admin Dashboard →</a></p>
  `
  await send(ADMIN_EMAIL, `New Booking: ${booking.guest_name} — ${formatDate(booking.check_in)}`, html)
}

export async function sendBookingConfirmed(booking: Booking) {
  const wa = await getWhatsApp()
  const html = `
    <h2 style="font-family:serif;color:#1a1a1a">Booking Confirmed!</h2>
    <p>Dear ${booking.guest_name},</p>
    <p>We are delighted to confirm your reservation at <strong>Sato Cave Hotel</strong>. We look forward to welcoming you!</p>
    ${bookingTable(booking, wa)}
    ${booking.admin_notes ? `<p><strong>Note from us:</strong> ${booking.admin_notes}</p>` : ""}
    <p style="color:#666;font-size:14px">If you need to make any changes, please contact us via WhatsApp${wa ? `: ${wa}` : ""}.</p>
    <p>Warm regards,<br>Sato Cave Hotel — Göreme, Cappadocia</p>
  `
  await send(booking.guest_email, "Booking Confirmed — Sato Cave Hotel", html)
}

export async function sendBookingRejected(booking: Booking) {
  const wa = await getWhatsApp()
  const html = `
    <h2 style="font-family:serif;color:#1a1a1a">Booking Update</h2>
    <p>Dear ${booking.guest_name},</p>
    <p>Unfortunately, we are unable to accommodate your booking request for the selected dates.</p>
    ${bookingTable(booking, wa)}
    ${booking.admin_notes ? `<p><strong>Message from us:</strong> ${booking.admin_notes}</p>` : ""}
    <p>We apologise for the inconvenience. Please contact us to explore alternative dates${wa ? ` via WhatsApp: ${wa}` : ""}.</p>
    <p>Warm regards,<br>Sato Cave Hotel — Göreme, Cappadocia</p>
  `
  await send(booking.guest_email, "Booking Update — Sato Cave Hotel", html)
}
