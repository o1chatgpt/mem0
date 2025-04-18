// Configuration with fallbacks for environment variables
// Create a function to get config values at runtime instead of build time
const getConfig = () => ({
  // Server configuration
  serverUrl: process.env.SERVER_URL || process.env.API_BASE_URL || "http://localhost:8888",
  serverApiKey: process.env.ANDIEGOGIAP_API_KEY || "default-key",

  // FTP configuration
  ftpHost: process.env.FTP_HOST || "localhost",
  ftpUser: process.env.FTP_USER || "user",
  ftpPassword: process.env.FTP_PASSWORD || "password",
  ftpPort: Number.parseInt(process.env.FTP_PORT || "21"),
  ftpRootDir: process.env.FTP_ROOT_DIR || "/",

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
  maxUploadSize: Number.parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE || "10485760"), // 10MB default

  // Admin credentials - for development/demo only
  adminUsername: "admin",
  adminEmail: "admin@andiegogiap.com",
  // Remove the NEXT_PUBLIC_ prefixed environment variable
  adminPassword: process.env.ADMIN_API_KEY || process.env.ANDIEGOGIAP_API_KEY || "admin",

  openaiApiKey: process.env.OPENAI_API_KEY || "",
})

// Export a proxy that calls getConfig() when properties are accessed
export const config = new Proxy({} as ReturnType<typeof getConfig>, {
  get: (target, prop) => {
    const config = getConfig()
    return config[prop as keyof ReturnType<typeof getConfig>]
  },
})
