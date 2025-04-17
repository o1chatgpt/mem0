"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/db"

export async function updateIntegrationConfig(integrationId: string, config: Record<string, any>) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error("You must be logged in to update integration configuration")
    }

    // Get the current integration to preserve sensitive data
    const { data: currentIntegration } = await supabase
      .from("user_integrations")
      .select("config")
      .eq("user_id", session.user.id)
      .eq("integration_id", integrationId)
      .single()

    if (!currentIntegration) {
      throw new Error("Integration not found")
    }

    // Preserve sensitive data like tokens
    const sensitiveKeys = ["access_token", "refresh_token", "expires_at", "provider_user_data"]
    const preservedConfig = {}

    sensitiveKeys.forEach((key) => {
      if (currentIntegration.config && currentIntegration.config[key]) {
        preservedConfig[key] = currentIntegration.config[key]
      }
    })

    // Merge the new config with preserved sensitive data
    const mergedConfig = {
      ...config,
      ...preservedConfig,
    }

    // Update the integration config
    const { error } = await supabase
      .from("user_integrations")
      .update({
        config: mergedConfig,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.user.id)
      .eq("integration_id", integrationId)

    if (error) {
      throw error
    }

    // Revalidate the dashboard and integrations pages
    revalidatePath("/dashboard")
    revalidatePath("/integrations")

    return { success: true }
  } catch (error) {
    console.error("Error updating integration config:", error)
    throw error
  }
}
