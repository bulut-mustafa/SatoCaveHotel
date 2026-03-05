"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

export function GalleryModal({
    images,
    open,
    onOpenChange,
    initialIndex = 0,
}: {
    images: string[]
    open: boolean
    onOpenChange: (open: boolean) => void
    initialIndex?: number
}) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)

    useEffect(() => {
        if (open) setCurrentIndex(initialIndex)
    }, [open, initialIndex])

    const next = () =>
        setCurrentIndex((prev) => (prev + 1) % images.length)

    const prev = () =>
        setCurrentIndex((prev) =>
            (prev - 1 + images.length) % images.length
        )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 border-none bg-black/95 max-w-5xl max-h-[96vh] overflow-hidden">        {/* CLOSE BUTTON */}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* SLIDER */}
                <div className="relative h-[85vh] overflow-hidden">
                    <motion.div
                        className="flex h-full"
                        animate={{ x: `-${currentIndex * 100}%` }}
                        transition={{ type: "spring", stiffness: 260, damping: 30 }}
                    >
                        {images.map((src, i) => (
                            <div key={i} className="relative h-full w-full flex-shrink-0">
                                <Image
                                    src={src}
                                    alt={`Gallery image ${i + 1}`}
                                    fill
                                    className="object-contain"
                                    priority={i === 0}
                                />
                            </div>
                        ))}
                    </motion.div>

                    {/* ARROWS */}
                    <button
                        onClick={prev}
                        className="absolute left-6 top-1/2 -translate-y-1/2 text-white"
                    >
                        <ChevronLeft className="h-10 w-10" />
                    </button>

                    <button
                        onClick={next}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-white"
                    >
                        <ChevronRight className="h-10 w-10" />
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}