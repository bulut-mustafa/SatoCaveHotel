"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { updateAbout } from "@/actions/about"
import type { AboutContent } from "@/types/content"

function AboutForm({
  content,
  onChange,
}: {
  content: AboutContent
  onChange: (c: AboutContent) => void
}) {
  const set = (key: keyof AboutContent, val: any) => onChange({ ...content, [key]: val })
  const setFeature = (key: keyof AboutContent["features"], val: string) =>
    onChange({ ...content, features: { ...content.features, [key]: val } })

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Input value={content.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Title Part 1</Label>
        <Textarea
          value={content.title_part_1}
          onChange={(e) => set("title_part_1", e.target.value)}
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label>Title Part 2 (highlighted)</Label>
        <Input value={content.title_part_2} onChange={(e) => set("title_part_2", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={content.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Feature Labels</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Fairy Chimneys</Label>
            <Input
              value={content.features.fairy_chimneys}
              onChange={(e) => setFeature("fairy_chimneys", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Balloon Views</Label>
            <Input
              value={content.features.balloon_views}
              onChange={(e) => setFeature("balloon_views", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Cave Rooms</Label>
            <Input
              value={content.features.cave_rooms}
              onChange={(e) => setFeature("cave_rooms", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Turkish Breakfast</Label>
            <Input
              value={content.features.turkish_breakfast}
              onChange={(e) => setFeature("turkish_breakfast", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AboutAdminClient({
  initialEn,
  initialTr,
}: {
  initialEn: AboutContent
  initialTr: AboutContent
}) {
  const [en, setEn] = useState(initialEn)
  const [tr, setTr] = useState(initialTr)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await Promise.all([updateAbout("en", en), updateAbout("tr", tr)])
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
          <AboutForm content={en} onChange={setEn} />
        </TabsContent>
        <TabsContent value="tr" className="pt-4">
          <AboutForm content={tr} onChange={setTr} />
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-3">
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
