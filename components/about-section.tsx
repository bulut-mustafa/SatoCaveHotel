import Image from "next/image"
import { Mountain, Sunrise, Home, Coffee } from "lucide-react"

export function AboutSection({ dict }: { dict: any }) {
  const features = [
    { icon: Mountain, label: dict.features.fairy_chimneys },
    { icon: Sunrise, label: dict.features.balloon_views },
    { icon: Home, label: dict.features.cave_rooms },
    { icon: Coffee, label: dict.features.turkish_breakfast },
  ]

  return (
    <section id="about" className="bg-background py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="px-6 lg:px-0">
            <p className="mb-4 text-xs tracking-[0.3em] text-foreground/50 uppercase">
              {dict.subtitle}
            </p>
            <h2 className="font-serif text-3xl font-bold leading-snug text-foreground md:text-3xl lg:text-4xl text-balance">
              {dict.title_part_1}
              <span className="text-foreground/70 italic">{dict.title_part_2}</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-foreground/65">
              {dict.description}
            </p>

            <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.label} className="flex flex-col items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border">
                    <feature.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <span className="text-center text-xs font-semibold tracking-wide text-foreground/80">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-full">
            <div className="relative w-full aspect-[4/5] md:aspect-square lg:aspect-[4/5] overflow-hidden rounded-none lg:rounded-2xl">
              <Image
                src="/images/sato-night.jpg"
                alt="Sato Cave Hotel exterior with natural stone facade carved into the Cappadocian hillside"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
