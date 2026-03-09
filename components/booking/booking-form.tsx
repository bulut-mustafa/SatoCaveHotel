"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const schema = z.object({
  guest_name: z.string().min(2, "Name is required"),
  guest_email: z.string().email("Valid email required"),
  guest_phone: z.string().min(6, "Phone is required"),
  num_guests: z.number().min(1).max(10),
  special_requests: z.string().optional(),
})

export type BookingFormValues = z.infer<typeof schema>

interface Props {
  capacity: number
  loading: boolean
  onSubmit: (values: BookingFormValues) => void
  dict: {
    guest_name: string
    email: string
    phone: string
    num_guests: string
    special_requests: string
    submit: string
  }
}

export function BookingForm({ capacity, loading, onSubmit, dict }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { num_guests: 1 },
  })

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label>{dict.guest_name}</Label>
        <Input {...register("guest_name")} disabled={loading} />
        {errors.guest_name && <p className="text-xs text-destructive">{errors.guest_name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>{dict.email}</Label>
        <Input type="email" {...register("guest_email")} disabled={loading} />
        {errors.guest_email && <p className="text-xs text-destructive">{errors.guest_email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>{dict.phone}</Label>
        <Input type="tel" {...register("guest_phone")} disabled={loading} />
        {errors.guest_phone && <p className="text-xs text-destructive">{errors.guest_phone.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>{dict.num_guests}</Label>
        <Select
          defaultValue="1"
          onValueChange={(v) => setValue("num_guests", Number(v))}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: Math.max(1, capacity) }, (_, i) => i + 1).map((n) => (
              <SelectItem key={n} value={String(n)}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>{dict.special_requests}</Label>
        <Textarea {...register("special_requests")} disabled={loading} rows={3} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting…" : dict.submit}
      </Button>
    </motion.form>
  )
}
