"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, DollarSign, Eye, EyeOff, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { reorderRooms, toggleRoomVisibility, deleteRoom } from "@/actions/rooms"
import type { AdminRoom } from "./page"

type PendingAction =
  | { type: "hide"; room: AdminRoom }
  | { type: "show"; room: AdminRoom }
  | { type: "delete"; room: AdminRoom }

function SortableRoom({
  room,
  isInitialized,
  onRequestToggle,
  onRequestDelete,
}: {
  room: AdminRoom
  isInitialized: boolean
  onRequestToggle: (room: AdminRoom) => void
  onRequestDelete: (room: AdminRoom) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: room.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 bg-card border rounded-lg p-4 transition-opacity ${room.hidden ? "opacity-50" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="relative h-14 w-20 rounded-md overflow-hidden bg-muted shrink-0">
        {room.mainImage && (
          <Image src={room.mainImage} alt={room.name} fill className="object-cover" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{room.name}</p>
          {room.hidden && (
            <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
              Hidden
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs capitalize">{room.type}</Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {room.price}/night
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {isInitialized && (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground"
              title={room.hidden ? "Show room" : "Hide room"}
              onClick={() => onRequestToggle(room)}
            >
              {room.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Delete room"
              onClick={() => onRequestDelete(room)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/rooms/${room.id}`}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Link>
        </Button>
      </div>
    </div>
  )
}

export function RoomsAdminList({
  initialRooms,
  isInitialized,
}: {
  initialRooms: AdminRoom[]
  isInitialized: boolean
}) {
  const [rooms, setRooms] = useState(initialRooms)
  const [saving, setSaving] = useState(false)
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [confirming, setConfirming] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = rooms.findIndex((r) => r.id === active.id)
    const newIndex = rooms.findIndex((r) => r.id === over.id)
    const newOrder = arrayMove(rooms, oldIndex, newIndex)
    setRooms(newOrder)

    setSaving(true)
    await reorderRooms(newOrder.map((r) => r.id))
    setSaving(false)
  }

  const handleConfirm = async () => {
    if (!pending) return
    setConfirming(true)

    if (pending.type === "delete") {
      setRooms((prev) => prev.filter((r) => r.id !== pending.room.id))
      await deleteRoom(pending.room.id)
    } else {
      const newHidden = pending.type === "hide"
      setRooms((prev) =>
        prev.map((r) => r.id === pending.room.id ? { ...r, hidden: newHidden } : r)
      )
      await toggleRoomVisibility(pending.room.id, newHidden)
    }

    setConfirming(false)
    setPending(null)
  }

  // Build dialog content based on pending action type
  const dialogContent = pending && (() => {
    const name = pending.room.name

    if (pending.type === "delete") {
      return {
        title: "Delete room?",
        description: `"${name}" will be permanently deleted. This cannot be undone.`,
        actionLabel: "Delete",
        actionClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      }
    }
    if (pending.type === "hide") {
      return {
        title: "Hide room?",
        description: `"${name}" will be hidden from the public site. Guests won't see it until you show it again.`,
        actionLabel: "Hide",
        actionClass: "",
      }
    }
    return {
      title: "Show room?",
      description: `"${name}" will become visible to guests on the public site.`,
      actionLabel: "Show",
      actionClass: "",
    }
  })()

  return (
    <>
      <div className="space-y-2">
        {saving && (
          <p className="text-xs text-muted-foreground text-right">Saving order…</p>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rooms.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            {rooms.map((room) => (
              <SortableRoom
                key={room.id}
                room={room}
                isInitialized={isInitialized}
                onRequestToggle={(r) => setPending({ type: r.hidden ? "show" : "hide", room: r })}
                onRequestDelete={(r) => setPending({ type: "delete", room: r })}
              />
            ))}
          </SortableContext>
        </DndContext>

        {rooms.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm border rounded-lg">
            No rooms yet. Click "Add room" to create one.
          </div>
        )}
      </div>

      <AlertDialog open={!!pending} onOpenChange={(open) => { if (!open) setPending(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent?.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialogContent?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirming}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={confirming}
              className={dialogContent?.actionClass}
            >
              {confirming ? "Please wait…" : dialogContent?.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
