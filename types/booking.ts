export interface Booking {
  id: string
  room_id: string
  check_in: string       // YYYY-MM-DD
  check_out: string      // YYYY-MM-DD
  guest_name: string
  guest_email: string
  guest_phone: string
  num_guests: number
  special_requests?: string
  status: "pending" | "accepted" | "rejected" | "cancelled"
  total_price: number
  admin_notes?: string
  created_at: string
  updated_at: string
}

export interface RoomBlock {
  id: string
  room_id: string
  start_date: string     // YYYY-MM-DD
  end_date: string       // YYYY-MM-DD
  reason?: string
  created_at: string
}

export interface PriceOverride {
  id: string
  room_id: string
  date: string           // YYYY-MM-DD
  price: number
  created_at: string
}

export interface AvailabilityData {
  unavailable_dates: string[]
  price_overrides: Record<string, number>
  base_price: number
}

export interface CreateBookingInput {
  room_id: string
  check_in: string
  check_out: string
  guest_name: string
  guest_email: string
  guest_phone: string
  num_guests: number
  special_requests?: string
}
