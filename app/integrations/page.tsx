import { getIntegrations, getUserIntegrations } from "@/lib/db"
import { createServerSupabaseClient } from "@/lib/db"
import IntegrationsPage from "@/components/integrations-page"

export default async function IntegrationsRoute() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get all integrations
  const integrations = await getIntegrations()

  // Get user's connected integrations if logged in
  let userIntegrations = []
  if (session?.user) {
    userIntegrations = await getUserIntegrations(session.user.id)
  }

  // Convert to a map of integration IDs for easier lookup
  const connectedIntegrations = new Map(userIntegrations.map((ui: any) => [ui.integration_id, ui]))

  return (
    <IntegrationsPage
      integrations={integrations}
      connectedIntegrations={Object.fromEntries(connectedIntegrations)}
      isLoggedIn={!!session?.user}
    />
  )
}
