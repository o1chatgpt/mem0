"use server"

import { revalidatePath } from "next/cache"
import { connectIntegration, disconnectIntegration } from "@/lib/db"
import { createServerSupabaseClient } from "@/lib/db"

export async function getCurrentUser() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.user
}

export async function connectIntegrationAction(integrationId: string) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("You must be logged in to connect an integration")
  }

  // Check if this integration exists but is inactive
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("integration_id", integrationId)
    .single()

  if (data) {
    // Reactivate existing integration
    await supabase
      .from("user_integrations")
      .update({
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("integration_id", integrationId)
  } else {
    // Create new integration connection
    await connectIntegration(user.id, integrationId)
  }

  revalidatePath("/integrations")
  revalidatePath("/dashboard")

  return { success: true }
}

export async function disconnectIntegrationAction(integrationId: string) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("You must be logged in to disconnect an integration")
  }

  await disconnectIntegration(user.id, integrationId)
  revalidatePath("/integrations")
  revalidatePath("/dashboard")

  return { success: true }
}
