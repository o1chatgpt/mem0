// Configuration with fallbacks for environment variables
export const config = {
  // Server configuration
  serverUrl: process.env.SERVER_URL || process.env.API_BASE_URL || "http://localhost:8888",
  serverApiKey: process.env.ANDIEGOGIAP_API_KEY || "default-key",
  jwtSecret: process.env.JWT_SECRET || process.env.ANDIEGOGIAP_API_KEY || "secure-jwt-secret",

  // FTP configuration
  ftpHost: process.env.FTP_HOST || "localhost",
  ftpUser: process.env.FTP_USER || "anonymous",
  ftpPassword: process.env.FTP_PASSWORD || "",
  ftpPort: Number.parseInt(process.env.FTP_PORT || "21", 10),
  ftpRootDir: process.env.FTP_ROOT_DIR || "/",

  // Network configuration for server chain
  networkServers:
    typeof process.env.NETWORK_SERVERS === "string" && process.env.NETWORK_SERVERS.startsWith("[")
      ? JSON.parse(process.env.NETWORK_SERVERS)
      : [{ name: "localhost", url: "http://localhost:3000", apiKey: "" }],

  // Collaboration settings
  enableRealTimeEditing: true,
  collaborationSocketUrl: process.env.COLLABORATION_SOCKET_URL || "ws://localhost:8080",

  // Mem0 configuration
  mem0ApiKey: process.env.MEM0_API_KEY || "",
  mem0ApiUrl: process.env.MEM0_API_URL || "https://api.mem0.ai",

  // Supabase configuration
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  // PostgreSQL configuration
  postgresUrl: process.env.POSTGRES_URL || "",
  postgresUser: process.env.POSTGRES_USER || "",
  postgresPassword: process.env.POSTGRES_PASSWORD || "",
  postgresHost: process.env.POSTGRES_HOST || "",
  postgresDatabase: process.env.POSTGRES_DATABASE || "",

  // App configuration
  appName: process.env.NEXT_PUBLIC_APP_NAME || "File Manager with Mem0",
  enableDemoMode: process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true",
  enableFileOperations: process.env.NEXT_PUBLIC_ENABLE_FILE_OPERATIONS !== "false",
  maxUploadSize: Number.parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE || "10485760", 10), // 10MB default

  // Admin credentials - for development/demo only
  adminUsername: "admin",
  adminEmail: "admin@andiegogiap.com",
  adminPassword: process.env.ANDIEGOGIAP_API_KEY || "admin",

  // API Partners configuration
  apiPartners: process.env.API_PARTNERS ? process.env.API_PARTNERS.split(",") : [],
}

// Create a separate client-side safe config object
export const clientConfig = {
  // Only include values that are safe for the client
  appName: config.appName,
  enableDemoMode: config.enableDemoMode,
  enableFileOperations: config.enableFileOperations,
  maxUploadSize: config.maxUploadSize,
  supabaseUrl: config.supabaseUrl,
  supabaseAnonKey: config.supabaseAnonKey,
  enableRealTimeEditing: config.enableRealTimeEditing,
  collaborationSocketUrl: config.collaborationSocketUrl,
}
