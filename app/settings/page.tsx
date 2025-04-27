import { ClientProvider } from "@/components/client-provider"
import { SettingsContent } from "@/components/settings-content"

export default function SettingsPage() {
  return (
    <ClientProvider>
      <SettingsContent />
    </ClientProvider>
  )
}
