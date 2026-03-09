"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { Activity } from "@/types/content"

interface Props {
  activities: Activity[]
  dict: {
    details_button: string
    book_activity: string
    close: string
  }
}

export function ActivitiesList({ activities, dict }: Props) {
  const [selected, setSelected] = useState<Activity | null>(null)

  return (
    <>
      <div className="flex flex-col gap-8">
        {activities.map((activity) => (
          <ActivityRow
            key={activity.id}
            activity={activity}
            dict={dict}
            onSelect={() => setSelected(activity)}
          />
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-background border-border">
          {selected && (
            <div className="flex flex-col">
              <div className="relative h-64 w-full">
                <Image
                  src={selected.localImage ?? selected.image_url}
                  alt={selected.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <h2 className="absolute bottom-6 left-6 right-6 text-3xl font-medium text-white">
                  {selected.title}
                </h2>
              </div>
              <div className="p-8">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {selected.description}
                </p>
                <div className="mt-8 flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setSelected(null)}>
                    {dict.close}
                  </Button>
                  <Button className="rounded-full">{dict.book_activity}</Button>
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
  activity: Activity
  dict: Props["dict"]
  onSelect: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const imageSrc = activity.localImage ?? activity.image_url

  const handleMouseEnter = () => {
    if (activity.video && videoRef.current) videoRef.current.play()
  }
  const handleMouseLeave = () => {
    if (activity.video && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <div
      className="group flex flex-col md:flex-row gap-6 bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onSelect}
    >
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
            onLoadedData={() => {
              if (videoRef.current) videoRef.current.currentTime = 0
            }}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <Image
            src={imageSrc}
            alt={activity.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
      </div>

      <div className="w-full md:w-3/5 p-6 md:py-8 md:pr-8 flex flex-col justify-center">
        <h2 className="text-2xl font-semibold mb-2">{activity.title}</h2>
        <p className="text-foreground/70 mb-4 line-clamp-3">{activity.description}</p>
        <div className="mt-auto pt-4 flex gap-4">
          <Button onClick={(e) => { e.stopPropagation(); onSelect() }} variant="default">
            {dict.details_button}
          </Button>
        </div>
      </div>
    </div>
  )
}
