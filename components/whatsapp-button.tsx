"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"

export function WhatsAppButton({ lang = "en" }: { lang?: string }) {
  const phone = "905465008775"

  const messages: any = {
    en: "Hello! I would like to ask about room availability.",
    tr: "Merhaba! Oda müsaitliği hakkında bilgi almak istiyorum.",
  }

  const labels: any = {
    en: "Ask about availability",
    tr: "Müsaitlik hakkında sor",
  }

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(messages[lang])}`

  const [hovered, setHovered] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      
      {/* Tooltip */}
      <div
        className={`hidden sm:block rounded-full bg-white px-4 py-2 text-sm shadow-lg transition-all duration-300 ${
          hovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
        }`}
      >
        {labels[lang]}
      </div>

      {/* Button */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-xl transition-transform hover:scale-110"
        aria-label="WhatsApp Chat"
      >
        {/* Pulse */}
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-40"></span>

        {/* Icon */}
        <MessageCircle className="relative h-7 w-7 text-white" />
      </a>
    </div>
  )
}