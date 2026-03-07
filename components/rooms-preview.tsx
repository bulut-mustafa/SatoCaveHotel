import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { Room } from "@/lib/rooms-data"

export function RoomsPreview({ dict, lang, rooms }: { dict: any; lang: string; rooms: Room[] }) {
  // User requested to feature Room 5, Room 2, and Room 7 specifically
  const featuredIds = ["black-stone-room-bathtub", "arena-stone-room-bathtub", "moon-cave"]

  // Filter for the requested IDs. If for some reason one isn't found, 
  // we could fallback to others, but we expect them to exist. 
  // We map from featuredIds to guarantee the ordering (5, 2, 7) rather than original array order.
  const previewRooms = featuredIds
    .map(id => rooms.find(r => r.id === id))
    .filter((r): r is Room => r !== undefined)

  return (
    <section id="rooms-preview" className="bg-background px-6 py-24 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row items-start justify-between gap-8">

        {/* LEFT COPY */}
        <div className="flex-1 w-full lg:max-w-md pt-8">
          <h2 className="font-sans text-4xl lg:text-3xl font-medium tracking-tight text-foreground mb-6 leading-[1.1]">
            <span className="block">{dict.title_line_1}</span>
            <span className="block">{dict.title_line_2}</span>
          </h2>
          <p className="mt-6 mb-10 text-base leading-relaxed text-muted-foreground">
            {dict.description}
          </p>

          <div className="flex items-center gap-4 mt-8">
            <Link
              href={`/${lang}/rooms`}
              className="group inline-flex items-center gap-2 rounded-full border border-foreground bg-background px-1 py-1 pl-6 text-sm font-semibold text-foreground transition-all hover:bg-foreground hover:text-background"
            >
              {dict.view_all || "View all Rooms"}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition-colors group-hover:bg-background group-hover:text-foreground border border-transparent group-hover:border-foreground">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </div>

        {/* RIGHT CARDS */}
        <div className="flex-[1.5] w-full mt-8 lg:mt-0 lg:pl-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {previewRooms.map((room) => (
              <Link
                key={room.id}
                href={`/${lang}/rooms`}
                className="group relative flex flex-col overflow-hidden rounded-sm bg-card transition-all hover:shadow-2xl hover:-translate-y-1 aspect-[3/4]"
              >
                {/* BACKGROUND IMAGE */}
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                {/* OVERLAY CONTENT */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                  {/* TOP PILL */}
                  <div className="self-start relative z-10 rounded-full border border-white/40 bg-black/20 backdrop-blur-md px-4 py-1.5 overflow-hidden">
                    <span className="relative z-10 text-xs font-medium tracking-wide text-white">
                      Detail
                    </span>
                  </div>

                  {/* BOTTOM TEXT */}
                  <div className="mt-auto">
                    <h3 className="font-sans text-xl font-medium text-white mb-2 leading-tight drop-shadow-sm">
                      {room.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
