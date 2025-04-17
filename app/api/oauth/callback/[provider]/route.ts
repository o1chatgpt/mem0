import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/db"
import { oauthProviders } from "@/lib/oauth-config"

export async function GET(request: NextRequest, { params }: { params: { provider: string } }) {
  const { provider } = params
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  // Handle errors from OAuth provider
  if (error) {
    return NextResponse.redirect(new URL(`/integrations?error=${error}`, request.url))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/integrations?error=missing_params", request.url))
  }

  try {
    // Verify the state parameter to prevent CSRF attacks
    const [userId, integrationId, timestamp] = state.split("|")

    // Check if the state is expired (10 minutes)
    const stateTimestamp = Number.parseInt(timestamp, 10)
    const now = Date.now()
    if (now - stateTimestamp > 10 * 60 * 1000) {
      return NextResponse.redirect(new URL("/integrations?error=state_expired", request.url))
    }

    // Get the OAuth configuration for the provider
    const providerConfig = oauthProviders[provider as keyof typeof oauthProviders]
    if (!providerConfig) {
      return NextResponse.redirect(new URL("/integrations?error=invalid_provider", request.url))
    }

    // Exchange the authorization code for an access token
    const tokenResponse = await fetch(providerConfig.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: providerConfig.clientId,
        client_secret: providerConfig.clientSecret,
        code,
        redirect_uri: providerConfig.redirectUri,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error("Token exchange error:", errorData)
      return NextResponse.redirect(new URL("/integrations?error=token_exchange_failed", request.url))
    }

    const tokenData = await tokenResponse.json()

    // Get user information from the provider
    let userData = {}

    if (provider === "github") {
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      })
      userData = await userResponse.json()
    } else if (provider === "google") {
      const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      })
      userData = await userResponse.json()
    } else if (provider === "slack") {
      // Slack already includes user info in the token response
      userData = {
        team: tokenData.team,
        user_id: tokenData.authed_user?.id,
      }
    }

    // Store the OAuth tokens and user data in the database
    const supabase = createServerSupabaseClient()

    // First, check if the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.redirect(new URL("/login?error=auth_required&redirect=/integrations", request.url))
    }

    // Store the OAuth connection in the database
    const { error: dbError } = await supabase.from("user_integrations").upsert({
      user_id: session.user.id,
      integration_id: integrationId,
      config: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : null,
        provider_user_data: userData,
      },
      is_active: true,
      updated_at: new Date().toISOString(),
    })

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.redirect(new URL("/integrations?error=database_error", request.url))
    }

    // Redirect back to the integrations page with success message
    return NextResponse.redirect(new URL(`/integrations?success=connected&provider=${provider}`, request.url))
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(new URL("/integrations?error=server_error", request.url))
  }
}
