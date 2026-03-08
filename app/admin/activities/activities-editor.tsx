"use client"

import { useState } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react"
import { updateActivities } from "@/actions/activities"
import type { Activity } from "@/types/content"

function ActivityEditor({
  activity,
  onChange,
}: {
  activity: Activity
  onChange: (a: Activity) => void
}) {
  const [open, setOpen] = useState(false)
  const set = (key: keyof Activity, val: string) => onChange({ ...activity, [key]: val })

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{activity.title || activity.id}</CardTitle>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4 pt-0">
          {(activity.localImage || activity.image_url) && (
            <div className="relative h-40 w-full rounded-md overflow-hidden bg-muted">
              <Image
                src={activity.localImage || activity.image_url}
                alt={activity.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={activity.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Short text</Label>
            <Input
              value={activity.short_text}
              onChange={(e) => set("short_text", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={activity.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Image URL (external)</Label>
            <Input
              value={activity.image_url}
              onChange={(e) => set("image_url", e.target.value)}
            />
          </div>
        </CardContent>
      )}
    </Card>
  )
}

function LangActivities({
  lang,
  activities,
  onChange,
}: {
  lang: "en" | "tr"
  activities: Activity[]
  onChange: (a: Activity[]) => void
}) {
  return (
    <div className="space-y-3">
      {activities.map((act, i) => (
        <ActivityEditor
          key={act.id}
          activity={act}
          onChange={(updated) => {
            const next = [...activities]
            next[i] = updated
            onChange(next)
          }}
        />
      ))}
    </div>
  )
}

export function ActivitiesAdminClient({
  initialEn,
  initialTr,
}: {
  initialEn: Activity[]
  initialTr: Activity[]
}) {
  const [en, setEn] = useState(initialEn)
  const [tr, setTr] = useState(initialTr)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await Promise.all([updateActivities("en", en), updateActivities("tr", tr)])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="en">
        <TabsList>
          <TabsTrigger value="en">English</TabsTrigger>
          <TabsTrigger value="tr">Turkish</TabsTrigger>
        </TabsList>
        <TabsContent value="en" className="pt-4">
          <LangActivities lang="en" activities={en} onChange={setEn} />
        </TabsContent>
        <TabsContent value="tr" className="pt-4">
          <LangActivities lang="tr" activities={tr} onChange={setTr} />
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save all activities"}
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
