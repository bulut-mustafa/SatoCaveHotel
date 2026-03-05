"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { type Room } from "@/lib/rooms-data"
import {
  Users,
  Bed,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Check,
  Maximize
} from "lucide-react"

import { GalleryModal } from "@/components/gallery-modal"

export function RoomModal({
  room,
  open,
  onOpenChange,
  dict,
}: {
  room: Room | null
  open: boolean
  onOpenChange: (open: boolean) => void
  dict?: any
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)

  useEffect(() => {
    if (!open) setCurrentImageIndex(0)
  }, [open])

  if (!room) return null

  const images = room.images
  const hasMultipleImages = images.length > 1

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex(
      (prev) => (prev - 1 + images.length) % images.length
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-2xl max-h-[95vh] flex flex-col border-none shadow-2xl bg-card">
        {/* IMAGE SECTION */}
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-muted">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setGalleryOpen(true)
            }}
            className="absolute right-3 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60"
          >
            <Maximize className="h-4 w-4" />
          </button>
          {/* SLIDER */}
          <motion.div
            className="flex h-full"
            animate={{ x: `-${currentImageIndex * 100}%` }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 30,
            }}
          >
            {images.map((src, index) => (
              <div
                key={index}
                className="relative h-full w-full flex-shrink-0"
              >
                <Image
                  src={src}
                  alt={`${room.name} ${index + 1}`}
                  className="object-cover"
                  priority={index === 0}
                  height={400}
                  width={800}
                />
              </div>
            ))}
          </motion.div>

          {hasMultipleImages && (
            <>
              {/* ARROWS */}
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* PAGINATION DOTS */}
              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-black/30 px-4 py-2 backdrop-blur-md">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImageIndex(index)
                    }}
                    className="relative h-2 w-2"
                  >
                    {/* background dot */}
                    <span className="absolute inset-0 rounded-full bg-white/40" />

                    {/* sliding active dot */}
                    {index === currentImageIndex && (
                      <motion.span
                        layoutId="activeDot"
                        className="absolute inset-0 rounded-full bg-white"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          <div className="flex flex-col gap-4">

            <DialogHeader className="text-left">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <DialogTitle className="font-serif text-xl font-bold text-foreground">
                    {room.name}
                  </DialogTitle>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-xl font-bold text-foreground">
                    ${room.price}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    / {dict?.room_modal?.night || "night"}
                  </span>
                </div>
              </div>
            </DialogHeader>

            {/* SPECS */}
            <div className="grid grid-cols-3 gap-3 rounded-xl bg-secondary/50 p-4">
              <div className="flex flex-col items-center text-center gap-1">
                <Maximize2 className="h-4 w-4 text-accent/80" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  {dict?.room_modal?.size || "Size"}
                </span>
                <span className="text-xs font-bold">{room.size}</span>
              </div>

              <div className="flex flex-col items-center text-center gap-1 border-x border-border/50">
                <Users className="h-4 w-4 text-accent/80" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  {dict?.room_modal?.guests || "Guests"}
                </span>
                <span className="text-xs font-bold">{room.capacity}</span>
              </div>

              <div className="flex flex-col items-center text-center gap-1">
                <Bed className="h-4 w-4 text-accent/80" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  {dict?.room_modal?.bed || "Bed"}
                </span>
                <span className="text-xs font-bold">{room.bedType}</span>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground/90">
                {dict?.room_modal?.about_experience || "About the Experience"}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground/90">
                {room.description}
              </p>
            </div>

            {/* AMENITIES */}
            <div className="space-y-3 pb-4">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground/90">
                {dict?.room_modal?.in_room_amenities || "In-Room Amenities"}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {room.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-foreground"
                  >
                    <Check className="h-3 w-3 text-accent" />
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </DialogContent>

      <GalleryModal
        images={images}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        initialIndex={currentImageIndex}
      />
    </Dialog>
  )
}