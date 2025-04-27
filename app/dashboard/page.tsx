import { ClientProvider } from "@/components/client-provider"
import { DashboardContent } from "@/components/dashboard-content"

export default function Dashboard() {
  return (
    <ClientProvider>
      <DashboardContent />
    </ClientProvider>
  )
}
