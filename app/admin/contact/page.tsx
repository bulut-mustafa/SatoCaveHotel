import { getContact } from "@/lib/content"
import { ContactAdminClient } from "./contact-editor"

export default async function AdminContactPage() {
  const contact = await getContact()

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Contact Info</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edit contact details shown in the footer and contact section
        </p>
      </div>
      <ContactAdminClient initialContact={contact} />
    </div>
  )
}
