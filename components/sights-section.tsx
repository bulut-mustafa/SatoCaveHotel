import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

export function SightsSection({ dict }: { dict: any }) {
    return (
        <section className="bg-background py-24 px-6 lg:px-8 overflow-hidden">
            <div className="mx-auto max-w-7xl">

                {/* TOP TEXT & BUTTON */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                    <div className="max-w-xl">
                        <h2 className="font-sans text-4xl sm:text-5xl font-medium tracking-tight text-foreground leading-[1.1] mb-6">
                            <span className="block">{dict.title_line_1}</span>
                            <span className="block">{dict.title_line_2}</span>
                        </h2>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-6 max-w-sm">
                        <p className="text-sm leading-relaxed text-muted-foreground md:text-right">
                            {dict.description}
                        </p>
                        <button className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-background px-1 py-1 pl-6 text-sm font-semibold text-foreground transition-all hover:bg-muted">
                            {dict.more_info}
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition-colors group-hover:bg-background group-hover:text-foreground">
                                <ArrowUpRight className="h-4 w-4" />
                            </div>
                        </button>
                    </div>
                </div>

                {/* MASONRY PICTURE GRID */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 min-h-[600px] auto-rows-[200px] md:auto-rows-auto">

                    {/* TALL LEFT IMAGE */}
                    <div className="md:col-span-4 relative rounded-3xl overflow-hidden shadow-lg h-[400px] md:h-full">
                        <Image
                            src="/images/hero-cappadocia.jpg"
                            alt="Cappadocia Hot Air Balloons"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </div>

                    {/* TWO STACKED IMAGES (CENTER-ISH) */}
                    <div className="md:col-span-4 flex flex-col gap-4 md:gap-6">
                        <div className="relative rounded-3xl overflow-hidden shadow-lg flex-1 min-h-[250px] md:min-h-0">
                            <Image
                                src="/images/rooms/Room-4/Room 4 (7).jpg"
                                alt="Local sights"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        <div className="relative rounded-3xl overflow-hidden shadow-lg flex-1 min-h-[250px] md:min-h-0">
                            <Image
                                src="/images/room-details/tea-set.jpg"
                                alt="Turkish Tea"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>

                    {/* TALL RIGHT IMAGE */}
                    <div className="md:col-span-4 relative rounded-3xl overflow-hidden shadow-lg h-[400px] md:h-full">
                        <Image
                            src="/images/terrace-breakfast.jpg"
                            alt="Terrace view"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </div>

                </div>

            </div>
        </section>
    )
}
