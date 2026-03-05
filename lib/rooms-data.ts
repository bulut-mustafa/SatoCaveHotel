export interface Room {
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

// Helper to assemble the rooms using the localized dictionary
export const getLocalizedRooms = (roomDetailsDict: Record<string, any>): Room[] => {
  return [
    {
      id: "white-stone-room-bathtub",
      name: roomDetailsDict["white-stone-room-bathtub"].name,
      type: "stone",
      tagline: roomDetailsDict["white-stone-room-bathtub"].tagline,
      description: roomDetailsDict["white-stone-room-bathtub"].description,
      price: 120,
      size: "22 sqm",
      capacity: 2,
      bedType: "King Bed",
      image: "/images/rooms/Room-1/Room 1 (1).jpg",
      images: Array.from({ length: 18 }, (_, i) => `/images/rooms/Room-1/Room 1 (${i + 1}).jpg`),
      amenities: roomDetailsDict["white-stone-room-bathtub"].amenities,
      highlights: roomDetailsDict["white-stone-room-bathtub"].highlights,
    },
    {
      id: "arena-stone-room-bathtub",
      name: roomDetailsDict["arena-stone-room-bathtub"].name,
      type: "stone",
      tagline: roomDetailsDict["arena-stone-room-bathtub"].tagline,
      description: roomDetailsDict["arena-stone-room-bathtub"].description,
      price: 90,
      size: "18 sqm",
      capacity: 2,
      bedType: "Double Bed",
      image: "/images/rooms/Room-2/Room 2 (1).jpg",
      images: Array.from({ length: 18 }, (_, i) => `/images/rooms/Room-2/Room 2 (${i + 1}).jpg`),
      amenities: roomDetailsDict["arena-stone-room-bathtub"].amenities,
      highlights: roomDetailsDict["arena-stone-room-bathtub"].highlights,
    },
    {
      id: "cooper-cave",
      name: roomDetailsDict["cooper-cave"].name,
      type: "cave",
      tagline: roomDetailsDict["cooper-cave"].tagline,
      description: roomDetailsDict["cooper-cave"].description,
      price: 160,
      size: "30 sqm",
      capacity: 3,
      bedType: "King Bed",
      image: "/images/rooms/Room-3/Room 3 (1).jpg",
      images: Array.from({ length: 18 }, (_, i) => `/images/rooms/Room-3/Room 3 (${i + 1}).jpg`),
      amenities: roomDetailsDict["cooper-cave"].amenities,
      highlights: roomDetailsDict["cooper-cave"].highlights,
    },
    {
      id: "olive-cave",
      name: roomDetailsDict["olive-cave"].name,
      type: "cave",
      tagline: roomDetailsDict["olive-cave"].tagline,
      description: roomDetailsDict["olive-cave"].description,
      price: 130,
      size: "20 sqm",
      capacity: 2,
      bedType: "King Bed",
      image: "/images/rooms/Room-4/Room 4 (1).jpg",
      images: Array.from({ length: 18 }, (_, i) => `/images/rooms/Room-4/Room 4 (${i + 1}).jpg`),
      amenities: roomDetailsDict["olive-cave"].amenities,
      highlights: roomDetailsDict["olive-cave"].highlights,
    },
    {
      id: "black-stone-room-bathtub",
      name: roomDetailsDict["black-stone-room-bathtub"].name,
      type: "stone",
      tagline: roomDetailsDict["black-stone-room-bathtub"].tagline,
      description: roomDetailsDict["black-stone-room-bathtub"].description,
      price: 140,
      size: "25 sqm",
      capacity: 2,
      bedType: "King Bed",
      image: "/images/rooms/Room-5/Room 5 (1).jpg",
      images: Array.from({ length: 18 }, (_, i) => `/images/rooms/Room-5/Room 5 (${i + 1}).jpg`),
      amenities: roomDetailsDict["black-stone-room-bathtub"].amenities,
      highlights: roomDetailsDict["black-stone-room-bathtub"].highlights,
    },
    {
      id: "moon-cave",
      name: roomDetailsDict["moon-cave"].name,
      type: "cave",
      tagline: roomDetailsDict["moon-cave"].tagline,
      description: roomDetailsDict["moon-cave"].description,
      price: 100,
      size: "20 sqm",
      capacity: 2,
      bedType: "Double Bed",
      image: "/images/rooms/Room-6/Room 6 (1).jpg",
      images: Array.from({ length: 18 }, (_, i) => `/images/rooms/Room-6/Room 6 (${i + 1}).jpg`),
      amenities: roomDetailsDict["moon-cave"].amenities,
      highlights: roomDetailsDict["moon-cave"].highlights,
    },
    {
      id: "amber-cave",
      name: roomDetailsDict["amber-cave"].name,
      type: "cave",
      tagline: roomDetailsDict["amber-cave"].tagline,
      description: roomDetailsDict["amber-cave"].description,
      price: 95,
      size: "19 sqm",
      capacity: 2,
      bedType: "Twin or Double",
      image: "/images/rooms/Room-7/Room 7 (1).jpg",
      images: Array.from({ length: 18 }, (_, i) => `/images/rooms/Room-7/Room 7 (${i + 1}).jpg`),
      amenities: roomDetailsDict["amber-cave"].amenities,
      highlights: roomDetailsDict["amber-cave"].highlights,
    },
    {
      id: "almond-cave-bathtub",
      name: roomDetailsDict["almond-cave-bathtub"].name,
      type: "cave",
      tagline: roomDetailsDict["almond-cave-bathtub"].tagline,
      description: roomDetailsDict["almond-cave-bathtub"].description,
      price: 110,
      size: "21 sqm",
      capacity: 2,
      bedType: "Double Bed",
      image: "/images/rooms/Room-8/Sato Room 8 (1).jpg",
      images: Array.from({ length: 18 }, (_, i) => `/images/rooms/Room-8/Sato Room 8 (${i + 1}).jpg`),
      amenities: roomDetailsDict["almond-cave-bathtub"].amenities,
      highlights: roomDetailsDict["almond-cave-bathtub"].highlights,
    },
  ]
}