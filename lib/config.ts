// Client-safe configuration (no sensitive data)
export const config = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "File Manager",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  enableDemoMode: process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true",
  enableFileOperations: process.env.NEXT_PUBLIC_ENABLE_FILE_OPERATIONS === "true",
  maxUploadSize: Number.parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE || "10485760", 10), // 10MB default
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
}

// Server-only configuration (contains sensitive data)
export const serverConfig = {
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET || "",

  // Database
  postgresUrl: process.env.POSTGRES_URL || "",
  postgresUser: process.env.POSTGRES_USER || "",
  postgresPassword: process.env.POSTGRES_PASSWORD || "",
  postgresDatabase: process.env.POSTGRES_DATABASE || "",
  postgresHost: process.env.POSTGRES_HOST || "",

  // FTP
  ftpHost: process.env.FTP_HOST || "",
  ftpUser: process.env.FTP_USER || "",
  ftpPassword: process.env.FTP_PASSWORD || "",
  ftpPort: Number.parseInt(process.env.FTP_PORT || "21", 10),
  ftpRootDir: process.env.FTP_ROOT_DIR || "/",

  // API Keys
  adminApiKey: process.env.ANDIEGOGIAP_API_KEY || "",

  // Mem0
  mem0ApiKey: process.env.MEM0_API_KEY || "",
  mem0ApiUrl: process.env.MEM0_API_URL || "https://api.mem0.ai",

  // Server
  serverUrl: process.env.SERVER_URL || "http://localhost:3000",
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3000/api",
  port: Number.parseInt(process.env.PORT || "3000", 10),
}
