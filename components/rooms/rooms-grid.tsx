"use client"

import { useState } from "react"
import Image from "next/image"
import type { Room } from "@/lib/rooms-data"
import { RoomModal } from "@/components/room-modal"

export function RoomsGrid({ dict, rooms }: { dict: any; rooms: Room[] }) {
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const [modalOpen, setModalOpen] = useState(false)

    const openRoom = (room: Room) => {
        setSelectedRoom(room)
        setModalOpen(true)
    }

    return (
        <>
            <section className="bg-background px-6 py-20 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="flex flex-col gap-24 md:gap-32">
                        {rooms.map((room, index) => {
                            const isEven = index % 2 === 0;

                            return (
                                <div
                                    key={room.id}
                                    className={`flex flex-col gap-8 lg:gap-16 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center`}
                                >

                                    {/* TEXT BLOCK */}
                                    <div className="flex-1 w-full flex flex-col justify-center">
                                        <div className={`max-w-md ${isEven ? 'mr-auto lg:pr-8' : 'ml-auto lg:pl-8'}`}>

                                            <div className="flex items-center gap-4 mb-4 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                                                <span>{room.bedType}</span>
                                                <span className="text-border/60">•</span>
                                                <span>{dict.rooms?.from} €{room.price}</span>
                                            </div>

                                            <h2 className="font-serif text-4xl lg:text-5xl font-normal text-foreground leading-[1.1] mb-6">
                                                {room.name}
                                            </h2>

                                            <p className="text-base leading-relaxed text-muted-foreground mb-8">
                                                {room.description}
                                            </p>

                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-8">
                                                <button
                                                    onClick={() => openRoom(room)}
                                                    className="bg-foreground hover:bg-foreground/80 text-background px-8 py-3.5 text-sm font-medium tracking-wide transition-colors"
                                                >
                                                    {dict.rooms_page?.view_details || 'View Details'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* IMAGE BLOCK */}
                                    <div className="flex-1 w-full relative">
                                        <div className="relative aspect-[4/3] w-full overflow-hidden shadow-sm lg:aspect-[3/2] bg-muted">
                                            <Image
                                                src={room.image}
                                                alt={room.name}
                                                fill
                                                className="object-cover transition-transform duration-700 hover:scale-105"
                                            />
                                        </div>
                                    </div>

                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            <RoomModal
                room={selectedRoom}
                open={modalOpen}
                onOpenChange={setModalOpen}
                dict={dict}
            />
        </>
    )
}
