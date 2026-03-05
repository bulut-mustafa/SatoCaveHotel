"use client";

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState, useRef } from "react"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"

export function ActivitiesList({ dict }: { dict: any }) {
    const [selectedActivity, setSelectedActivity] = useState<any>(null)

    const activities = [
        { id: 'hot_air_balloons', data: dict.hot_air_balloons, video: '/videos/compressed/hot-air-balloon.mp4', poster: dict.hot_air_balloons.image_url },
        { id: 'horseback_riding', data: dict.horseback_riding, video: '/videos/compressed/horse.mp4', poster: dict.horseback_riding.image_url },
        { id: 'green_tour', data: dict.green_tour, image: '/images/greentour-ihlara.jpg' },
        { id: 'red_tour', data: dict.red_tour, video: '/videos/compressed/uchisar-castle.mp4', poster: '/images/uchisar-castle.jpg', image: '/images/uchisar-castle.jpg' },
        { id: 'underground_cities', data: dict.underground_cities, image: '/images/greentour-derinkuyu.jpg' },
    ]

    return (
        <>
            <div className="flex flex-col gap-8">
                {activities.map((activity) => (
                    <ActivityRow
                        key={activity.id}
                        activity={activity}
                        dict={dict}
                        onSelect={() => setSelectedActivity(activity)}
                    />
                ))}
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
        </>
    )
}

function ActivityRow({
    activity,
    dict,
    onSelect,
}: {
    activity: any
    dict: any
    onSelect: () => void
}) {
    const videoRef = useRef<HTMLVideoElement>(null)

    const handleMouseEnter = () => {
        if (activity.video && videoRef.current) {
            videoRef.current.play()
        }
    }

    const handleMouseLeave = () => {
        if (activity.video && videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
        }
    }

    const handleLoadedData = () => {
        if (activity.video && videoRef.current) {
            videoRef.current.currentTime = 0
        }
    }

    const imageSrc = activity.image ?? activity.data.image_url

    return (
        <div
            className="group flex flex-col md:flex-row gap-6 bg-card border border-border rounded-3xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={onSelect}
        >
            {/* Media side */}
            <div
                className="relative w-full md:w-2/5 h-64 md:h-auto min-h-[250px] overflow-hidden"
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
            </div>

            {/* Text side */}
            <div className="w-full md:w-3/5 p-6 md:py-8 md:pr-8 flex flex-col justify-center">
                <h2 className="text-2xl font-semibold mb-2">{activity.data.title}</h2>
                <p className="text-foreground/70 mb-4 line-clamp-3">
                    {activity.data.description}
                </p>

                <div className="mt-auto pt-4 flex gap-4">
                    <Button
                        onClick={(e) => { e.stopPropagation(); onSelect(); }}
                        variant="default"
                    >
                        {dict.details_button}
                    </Button>
                </div>
            </div>
        </div>
    )
}
