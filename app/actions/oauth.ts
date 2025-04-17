"use server"

import { getAuthorizationUrl, isOAuthConfigured } from "@/lib/oauth-config"
import { createServerSupabaseClient } from "@/lib/db"

export async function initiateOAuthFlow(provider: string, integrationId: string) {
  try {
    // Check if OAuth is configured for this provider
    if (!isOAuthConfigured(provider as keyof typeof import("@/lib/oauth-config").oauthProviders)) {
      return {
        error: `OAuth not configured: ${provider} integration is not properly configured. Please contact the administrator.`,
        code: "oauth_not_configured",
      }
    }

    // Get the current user
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        error: "You must be logged in to connect an integration",
        code: "auth_required",
      }
    }

    // Generate a state parameter to prevent CSRF attacks
    // Format: userId|integrationId|timestamp
    const state = `${session.user.id}|${integrationId}|${Date.now()}`

    // Generate the authorization URL
    const authUrl = getAuthorizationUrl(provider as keyof typeof import("@/lib/oauth-config").oauthProviders, state)

    // Return the URL instead of redirecting
    return { url: authUrl }
  } catch (error) {
    console.error("OAuth initiation error:", error)
    return {
      error: error instanceof Error ? error.message : "Failed to initiate OAuth flow",
      code: "oauth_error",
    }
  }
}
