import { ClientProvider } from "@/components/client-provider"
import { AdminContent } from "@/components/admin-content"

export default function AdminPage() {
  return (
    <ClientProvider>
      <AdminContent />
    </ClientProvider>
  )
}
