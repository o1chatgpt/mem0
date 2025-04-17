// OAuth configuration for supported providers

export const oauthProviders = {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    authorizationUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    scope: "repo user",
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/oauth/callback/github`,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope:
      "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/oauth/callback/google`,
  },
  slack: {
    clientId: process.env.SLACK_CLIENT_ID || "",
    clientSecret: process.env.SLACK_CLIENT_SECRET || "not-required-for-preview",
    authorizationUrl: "https://slack.com/oauth/v2/authorize",
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    scope: "channels:read chat:write users:read",
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/oauth/callback/slack`,
  },
}

// Helper function to check if OAuth is configured for a provider
export function isOAuthConfigured(provider: keyof typeof oauthProviders): boolean {
  const config = oauthProviders[provider]
  return !!config.clientId && !!config.clientSecret
}

// Helper function to generate OAuth authorization URLs
export function getAuthorizationUrl(provider: keyof typeof oauthProviders, state: string) {
  const config = oauthProviders[provider]

  if (!config.clientId) {
    throw new Error(`OAuth not configured: Missing client ID for ${provider}`)
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    response_type: "code",
    state,
  })

  return `${config.authorizationUrl}?${params.toString()}`
}
