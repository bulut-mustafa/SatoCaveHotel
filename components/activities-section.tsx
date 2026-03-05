"use client";

import Image from "next/image"
import { ArrowUpRight, Info } from "lucide-react"
import { useState, useRef } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function ActivitiesSection({ dict, lang }: { dict: any, lang: string }) {
    const [selectedActivity, setSelectedActivity] = useState<any>(null);

    const activities = [
        { id: 'hot_air_balloons', data: dict.hot_air_balloons, video: '/videos/compressed/hot-air-balloon.mp4', poster: dict.hot_air_balloons.image_url, hoverOnly: true },
        { id: 'horseback_riding', data: dict.horseback_riding, video: '/videos/compressed/horse.mp4', poster: dict.horseback_riding.image_url, hoverOnly: true },
        { id: 'green_tour', data: dict.green_tour, image: '/images/greentour-ihlara.jpg' },
        { id: 'red_tour', data: dict.red_tour, video: '/videos/compressed/uchisar-castle.mp4', poster: '/images/uchisar-castle.jpg', image: '/images/uchisar-castle.jpg', hoverOnly: true },
        { id: 'underground_cities', data: dict.underground_cities, image: '/images/greentour-derinkuyu.jpg' }
    ]

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
                        <Link href={`/${lang}/activities`}>
                            <button className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-background px-1 py-1 pl-6 text-sm font-semibold text-foreground transition-all hover:bg-muted">
                                {dict.see_all_activities}
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition-colors group-hover:bg-background group-hover:text-foreground">
                                    <ArrowUpRight className="h-4 w-4" />
                                </div>
                            </button>
                        </Link>
                    </div>
                </div>

                {/* BENTO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-4 min-h-[600px] auto-rows-[200px] md:auto-rows-auto">

                    {/* TALL LEFT IMAGE (Hot Air Balloons) */}
                    <ActivityCard
                        activity={activities[0]}
                        className="md:col-span-4 h-[400px] md:h-full"
                        onSelect={() => setSelectedActivity(activities[0])}
                        dict={dict}
                    />

                    {/* CENTER STACKED (Horseback & Green Tour) */}
                    <div className="md:col-span-4 flex flex-col gap-4 md:gap-6">
                        <ActivityCard
                            activity={activities[1]}
                            className="flex-1 min-h-[250px] md:min-h-0"
                            onSelect={() => setSelectedActivity(activities[1])}
                            dict={dict}
                        />
                        <ActivityCard
                            activity={activities[2]}
                            className="flex-1 min-h-[250px] md:min-h-0"
                            onSelect={() => setSelectedActivity(activities[2])}
                            dict={dict}
                        />
                    </div>

                    {/* RIGHT COLUMN STACKED (Red Tour & Underground Cities) */}
                    <div className="md:col-span-4 flex flex-col gap-4 md:gap-6 h-[500px] md:h-full">
                        <ActivityCard
                            activity={activities[3]}
                            className="flex-[2] min-h-[250px] md:min-h-0"
                            onSelect={() => setSelectedActivity(activities[3])}
                            dict={dict}
                        />
                        <ActivityCard
                            activity={activities[4]}
                            className="flex-1 min-h-[150px] md:min-h-0"
                            onSelect={() => setSelectedActivity(activities[4])}
                            dict={dict}
                        />
                    </div>

                </div>

                {/* MODAL */}
                <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
                    <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-background border-border">
                        {selectedActivity && (
                            <div className="flex flex-col">
                                <div className="relative h-64 w-full">
                                    <Image
                                        src={selectedActivity.image ?? selectedActivity.data.image_url}
                                        alt={selectedActivity.data.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    <h2 className="absolute bottom-6 left-6 right-6 text-3xl font-medium text-white">
                                        {selectedActivity.data.title}
                                    </h2>
                                </div>
                                <div className="p-8">
                                    <p className="text-muted-foreground leading-relaxed text-lg">
                                        {selectedActivity.data.description}
                                    </p>
                                    <div className="mt-8 flex justify-end gap-4">
                                        <Button variant="outline" onClick={() => setSelectedActivity(null)}>
                                            {dict.close}
                                        </Button>
                                        <Button className="rounded-full">
                                            {dict.book_activity}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

            </div>
        </section>
    )
}

function ActivityCard({
    activity,
    className,
    onSelect,
    dict
}: {
    activity: any,
    className?: string,
    onSelect: () => void,
    dict: any
}) {
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleMouseEnter = () => {
        if (activity.hoverOnly && videoRef.current) {
            videoRef.current.play();
        }
    };

    const handleMouseLeave = () => {
        if (activity.hoverOnly && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    // Once video data is loaded, seek to frame 0 so first frame is painted
    const handleLoadedData = () => {
        if (activity.hoverOnly && videoRef.current) {
            videoRef.current.currentTime = 0;
        }
    };

    const imageSrc = activity.image ?? activity.data.image_url;

    return (
        <div
            className={`group relative rounded-sm overflow-hidden shadow-lg cursor-pointer ${className}`}
            onClick={onSelect}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {activity.video ? (
                <video
                    ref={videoRef}
                    src={activity.video}
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onLoadedData={handleLoadedData}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            ) : (
                <Image
                    src={imageSrc}
                    alt={activity.data.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
            )}

            {/* Gradient Overlay that appears on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-medium text-xl mb-2">{activity.data.title}</h3>
                    <p className="text-white/80 text-sm mb-4 line-clamp-2">
                        {activity.data.short_text}
                    </p>
                    <button className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black">
                        <Info className="w-4 h-4" />
                        {dict.details_button}
                    </button>
                </div>
            </div>
        </div>
    )
}
