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
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {rooms.map((room) => (
                            <button
                                key={room.id}
                                onClick={() => openRoom(room)}
                                className="group flex flex-col overflow-hidden border border-border bg-card text-left transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                            >
                                <div className="relative aspect-[4/3] w-full overflow-hidden">
                                    <Image
                                        src={room.image}
                                        alt={room.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex flex-1 w-full flex-col gap-2 p-5">
                                    <h2 className="font-serif text-lg font-semibold text-card-foreground">
                                        {room.name}
                                    </h2>
                                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                                        {room.tagline}
                                    </p>
                                    <div className="mt-auto flex w-full items-center justify-between pt-3">
                                        <p className="text-sm font-semibold text-accent">
                                            {dict.rooms?.from + " \u20AC"}{room.price}
                                            <span className="font-normal text-muted-foreground">
                                                {" "}/ {dict.rooms?.night}
                                            </span>
                                        </p>
                                        <span className="text-xs font-medium text-accent transition-colors group-hover:text-accent/80">
                                            {dict.rooms_page.view_details}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
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
