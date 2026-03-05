"use client"

import Image from "next/image"
import { ArrowDown } from "lucide-react"

export function HeroSection({ dict }: { dict: any }) {
  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden">

      {/* FULL SCREEN BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/cappadocia-hero-2.jpg"
          alt="Sato Cave Hotel Exterior"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark overlay so the white text pops without needing a sky CSS gradient */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* CENTERED TEXT CONTENT */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex-grow flex flex-col justify-center">
        <h1 className="font-sans text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] font-medium tracking-tight text-white mb-6 leading-[1.05] text-balance drop-shadow-lg">
          <span className="block">{dict.title_line_1}</span>
          <span className="block">{dict.title_line_2_a} {dict.title_line_2_b}</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/95 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
          {dict.description}
        </p>
      </div>

      {/* EXPLORE MORE BUTTON */}
      <div className="relative z-20 flex flex-col items-center mt-auto">
        <span className="text-xs sm:text-sm font-semibold text-foreground/80 mb-3 bg-background/60 backdrop-blur-md px-4 py-1 rounded-full shadow-sm">
          Explore more
        </span>
        <button
          onClick={() => {
            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-lg text-foreground transition-all hover:scale-105 hover:shadow-xl border border-border/40"
          aria-label="Scroll down"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      </div>

    </section>
  )
}
