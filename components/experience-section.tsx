"use client"

import Image from "next/image"

export function ExperienceSection({ dict }: { dict: any }) {
  // Facility data mimicking the 5 cards in the mockup
  const facilities = [
    {
      id: "f1",
      title: dict.f1 || "Mini Bar",
      image: "/images/room-details/tea-set.jpg",
      deg: "25deg",
      tz: "-60px",
      height: "h-[220px] md:h-[320px]",
    },
    {
      id: "f2",
      title: dict.f2 || "Workspace",
      image: "/images/room-details/antique-desk.jpg",
      deg: "15deg",
      tz: "-30px",
      height: "h-[260px] md:h-[380px]",
    },
    {
      id: "f3",
      title: dict.f3 || "Jacuzzi Bathroom",
      image: "/images/room-details/bathtub.jpg",
      deg: "0deg",
      tz: "40px",
      height: "h-[300px] md:h-[460px]", // Center image is largest
    },
    {
      id: "f4",
      title: dict.f4 || "Library Room",
      image: "/images/rooms/Room-4/Room 4 (8).jpg",
      deg: "-15deg",
      tz: "-30px",
      height: "h-[260px] md:h-[380px]",
    },
    {
      id: "f5",
      title: dict.f5 || "Restaurant",
      image: "/images/terrace-breakfast.jpg",
      deg: "-25deg",
      tz: "-60px",
      height: "h-[220px] md:h-[320px]",
    },
  ]

  return (
    <section className="bg-background py-24 px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-7xl">

        {/* HEADER TEXT - LEFT AND RIGHT */}
        <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center mb-24 gap-12">
          <div className="max-w-sm lg:max-w-md">
            <p className="text-sm md:text-md leading-relaxed text-muted-foreground">
              {dict.description}
            </p>
          </div>
          <div className="max-w-md text-left md:text-right">
            <h2 className="font-sans text-4xl md:text-3xl lg:text-4xl font-medium tracking-tight text-foreground leading-[1.1]">
              <span className="block">{dict.title_line_1}</span>
              <span className="block">{dict.title_line_2}</span>
            </h2>
          </div>
        </div>

        {/* 5-CARD FAN SPREAD */}
        <div
          className="relative flex justify-center items-start gap-1 sm:gap-4 lg:gap-8 min-h-[400px] md:min-h-[500px]"
          style={{ perspective: "1200px" }}
        >
          {facilities.map((facility, index) => (
            <div
              key={facility.id}
              className={`relative flex-shrink-0 w-[110px] sm:w-[150px] md:w-[220px] rounded-sm overflow-hidden transition-all duration-700 shadow-2xl ${facility.height} [transform:rotateY(var(--rot-y))_translateZ(var(--tz))]`}
              style={{
                "--rot-y": facility.deg,
                "--tz": facility.tz,
                zIndex: index === 2 ? 40 : 30 - Math.abs(2 - index) * 10,
              } as React.CSSProperties}
            >
              <Image
                src={facility.image}
                alt={facility.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-0 right-0 text-center px-1 md:px-4">
                <span className="text-white font-medium text-xs sm:text-sm md:text-lg tracking-wide drop-shadow-md pb-2">
                  {facility.title}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
