"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Plus, Trash2, GripVertical } from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { updateContact } from "@/actions/contact"
import type { ContactField, ContactInfo } from "@/types/content"

const FIELD_TYPES: { value: ContactField["type"]; label: string }[] = [
  { value: "address", label: "Address" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "social", label: "Social Link" },
  { value: "custom", label: "Custom" },
]

const SHOW_HREF: ContactField["type"][] = ["address", "social", "custom"]

function SortableField({
  field,
  onChange,
  onDelete,
}: {
  field: ContactField
  onChange: (f: ContactField) => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id })

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  const set = (key: keyof ContactField, val: string) => onChange({ ...field, [key]: val })

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg p-4 bg-card space-y-3">
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Label</Label>
            <Input
              value={field.label}
              onChange={(e) => set("label", e.target.value)}
              placeholder="e.g. Phone, Address…"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Type</Label>
            <Select value={field.type} onValueChange={(v) => set("type", v as ContactField["type"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <button
          onClick={onDelete}
          className="shrink-0 p-1.5 text-muted-foreground hover:text-destructive transition-colors"
          title="Remove field"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 pl-6">
        <div className="space-y-1">
          <Label className="text-xs">Value (displayed text)</Label>
          <Input
            value={field.value}
            onChange={(e) => set("value", e.target.value)}
            placeholder={field.type === "email" ? "info@example.com" : field.type === "phone" ? "+90 000 000 00 00" : "Display text…"}
          />
        </div>
        {SHOW_HREF.includes(field.type) && (
          <div className="space-y-1">
            <Label className="text-xs">
              {field.type === "address" ? "Map link (optional)" : "URL"}
            </Label>
            <Input
              value={field.href ?? ""}
              onChange={(e) => set("href", e.target.value)}
              placeholder="https://…"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export function ContactAdminClient({ initialContact }: { initialContact: ContactInfo }) {
  const [fields, setFields] = useState<ContactField[]>(initialContact.fields)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)
    setFields(arrayMove(fields, oldIndex, newIndex))
  }

  const addField = () => {
    const id = `field_${Date.now()}`
    setFields((prev) => [
      ...prev,
      { id, label: "", value: "", type: "custom" },
    ])
  }

  const handleSave = async () => {
    setSaving(true)
    await updateContact({ fields })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          {fields.map((field, i) => (
            <SortableField
              key={field.id}
              field={field}
              onChange={(updated) => {
                const next = [...fields]
                next[i] = updated
                setFields(next)
              }}
              onDelete={() => setFields(fields.filter((_, j) => j !== i))}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button variant="outline" className="w-full gap-2" onClick={addField}>
        <Plus className="h-4 w-4" />
        Add field
      </Button>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>
    </div>
  )
}
