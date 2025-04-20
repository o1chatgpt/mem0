import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { config } from "@/lib/config"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    // Only allow admin users to access this endpoint
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return a sanitized version of the config (hide sensitive values)
    return NextResponse.json({
      serverUrl: config.serverUrl,
      serverApiKeySet: !!config.serverApiKey,
      ftpHost: config.ftpHost,
      ftpUser: config.ftpUser,
      ftpPortSet: !!config.ftpPort,
      mem0ApiKeySet: !!config.mem0ApiKey,
      mem0ApiUrl: config.mem0ApiUrl,
      appName: config.appName,
      enableDemoMode: config.enableDemoMode,
      enableFileOperations: config.enableFileOperations,
      maxUploadSize: config.maxUploadSize,
      adminUsername: config.adminUsername,
      // Show first and last 3 characters of the admin password for debugging
      adminPasswordHint: config.adminPassword
        ? `${config.adminPassword.substring(0, 3)}...${config.adminPassword.substring(config.adminPassword.length - 3)}`
        : "not set",

      // List all environment variables (keys only)
      envVars: Object.keys(process.env),
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json(
      {
        error: "Debug check failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
