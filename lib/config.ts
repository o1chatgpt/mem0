// Check if we're in the browser environment
const isBrowser = typeof window !== "undefined"

// Default configuration
const defaultConfig = {
  appName: "File Manager",
  apiBaseUrl: "/api",
  maxUploadSize: 50 * 1024 * 1024, // 50MB
  enableDemoMode: false,
  enableFileOperations: true,
  enableRealTimeEditing: false, // Disable real-time editing by default
  collaborationSocketUrl: "", // Empty by default
  apiPartners: [] as string[],
}

// Load configuration from environment variables
const envConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME,
  enableDemoMode: process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true",
  enableFileOperations: process.env.NEXT_PUBLIC_ENABLE_FILE_OPERATIONS !== "false",
  maxUploadSize: process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE
    ? Number.parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE, 10)
    : undefined,
  enableRealTimeEditing: process.env.ENABLE_REAL_TIME_EDITING === "true",
  collaborationSocketUrl: process.env.COLLABORATION_SOCKET_URL || "",
  apiPartners: process.env.API_PARTNERS ? process.env.API_PARTNERS.split(",") : [],
}

// Merge default config with environment variables
export const config = {
  ...defaultConfig,
  ...Object.fromEntries(Object.entries(envConfig).filter(([_, value]) => value !== undefined)),
}

// Add runtime check for browser-specific configuration
if (isBrowser) {
  // Disable real-time editing if the socket URL is invalid
  if (config.enableRealTimeEditing && config.collaborationSocketUrl) {
    const url = config.collaborationSocketUrl
    if (!url.startsWith("ws://") && !url.startsWith("wss://")) {
      console.warn("Invalid WebSocket URL format. Disabling real-time editing.")
      config.enableRealTimeEditing = false
    }
  }

  console.log("App configuration loaded:", {
    appName: config.appName,
    enableDemoMode: config.enableDemoMode,
    enableFileOperations: config.enableFileOperations,
    enableRealTimeEditing: config.enableRealTimeEditing,
    // Don't log the full socket URL for security reasons
    hasCollaborationUrl: !!config.collaborationSocketUrl,
  })
}
