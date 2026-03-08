import type { ContactInfo } from "@/types/content"

export function getDefaultContact(): ContactInfo {
  return {
    fields: [
      { id: "address", label: "Address", value: "Orta Mah, Konak Sk. No:9, 50180 Göreme/Nevşehir", href: "https://maps.app.goo.gl/EzbD57mNWvfBqnCN8", type: "address" },
      { id: "phone1", label: "Phone", value: "+90 546 500 87 75", type: "phone" },
      { id: "phone2", label: "Phone 2", value: "+90 554 205 00 08", type: "phone" },
      { id: "email", label: "Email", value: "satocavehotel@gmail.com", type: "email" },
      { id: "instagram", label: "Instagram", value: "@satocave", href: "https://instagram.com/satocave", type: "social" },
      { id: "tripadvisor", label: "TripAdvisor", value: "Sato Cave Hotel", href: "https://www.tripadvisor.com.tr/Hotel_Review-g297983-d645745-Reviews-Sato_Cave_Hotel-Goreme_Cappadocia.html?m=19905", type: "social" },
    ],
  }
}
