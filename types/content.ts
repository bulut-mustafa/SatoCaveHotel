export interface RoomData {
  id: string
  type: "cave" | "arched" | "stone"
  price: number
  size: string
  capacity: number
  bedType: string
  images: string[]
  mainImage: string
  hidden?: boolean
}

export interface RoomContent {
  name: string
  tagline: string
  description: string
  amenities: string[]
  highlights: string[]
}

export interface Activity {
  id: string
  title: string
  short_text: string
  description: string
  image_url: string
  video?: string
  poster?: string
  localImage?: string
}

export interface AboutContent {
  subtitle: string
  title_part_1: string
  title_part_2: string
  description: string
  features: {
    fairy_chimneys: string
    balloon_views: string
    cave_rooms: string
    turkish_breakfast: string
  }
}

export interface ContactField {
  id: string
  label: string
  value: string
  href?: string
  type: "address" | "phone" | "email" | "social" | "custom"
}

export interface ContactInfo {
  fields: ContactField[]
}

export interface FullRoom {
  id: string
  name: string
  type: "cave" | "arched" | "stone"
  tagline: string
  description: string
  price: number
  size: string
  capacity: number
  bedType: string
  image: string
  images: string[]
  amenities: string[]
  highlights: string[]
}
