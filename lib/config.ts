// Configuration settings for the application
const defaultConfig = {
  serverUrl: "http://localhost:3000",
  serverApiKey: "",
  ftpHost: "",
  ftpUser: "",
  ftpPassword: "",
  ftpPort: 21,
  ftpRootDir: "/",
  mem0ApiKey: "",
  mem0ApiUrl: "https://api.mem0.ai",
  appName: "File Manager",
  enableDemoMode: false,
  enableFileOperations: true,
  maxUploadSize: 10, // MB
  adminUsername: "admin",
  adminPassword: "admin",
  supabaseUrl: "",
  supabaseAnonKey: "",
}

// Safe environment variable getter
const getEnvVar = (key: string, defaultValue = ""): string => {
  try {
    // For server-side
    if (typeof process !== "undefined" && process.env) {
      return process.env[key] || defaultValue
    }
    // For client-side (only NEXT_PUBLIC_ vars)
    if (typeof window !== "undefined" && key.startsWith("NEXT_PUBLIC_")) {
      return (window as any).__ENV?.[key] || defaultValue
    }
    return defaultValue
  } catch (error) {
    console.error(`Error accessing environment variable ${key}:`, error)
    return defaultValue
  }
}

// Safe boolean parser
const parseBool = (value: string | undefined): boolean => {
  if (!value) return false
  return ["true", "1", "yes"].includes(value.toLowerCase())
}

// Safe number parser
const parseNum = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue
  const parsed = Number.parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

// Export the configuration
export const config = {
  serverUrl: getEnvVar("SERVER_URL", defaultConfig.serverUrl),
  serverApiKey: getEnvVar("ADMIN_API_KEY", defaultConfig.serverApiKey),
  ftpHost: getEnvVar("FTP_HOST", defaultConfig.ftpHost),
  ftpUser: getEnvVar("FTP_USER", defaultConfig.ftpUser),
  ftpPassword: getEnvVar("FTP_PASSWORD", defaultConfig.ftpPassword),
  ftpPort: parseNum(getEnvVar("FTP_PORT"), defaultConfig.ftpPort),
  ftpRootDir: getEnvVar("FTP_ROOT_DIR", defaultConfig.ftpRootDir),
  mem0ApiKey: getEnvVar("MEM0_API_KEY", defaultConfig.mem0ApiKey),
  mem0ApiUrl: getEnvVar("MEM0_API_URL", defaultConfig.mem0ApiUrl),
  appName: getEnvVar("NEXT_PUBLIC_APP_NAME", defaultConfig.appName),
  enableDemoMode: parseBool(getEnvVar("NEXT_PUBLIC_ENABLE_DEMO_MODE")) || defaultConfig.enableDemoMode,
  enableFileOperations:
    parseBool(getEnvVar("NEXT_PUBLIC_ENABLE_FILE_OPERATIONS")) || defaultConfig.enableFileOperations,
  maxUploadSize: parseNum(getEnvVar("NEXT_PUBLIC_MAX_UPLOAD_SIZE"), defaultConfig.maxUploadSize),
  adminUsername: getEnvVar("ADMIN_USERNAME", defaultConfig.adminUsername),
  adminPassword: getEnvVar("ADMIN_PASSWORD", defaultConfig.adminPassword),
  supabaseUrl: getEnvVar("NEXT_PUBLIC_SUPABASE_URL", defaultConfig.supabaseUrl),
  supabaseAnonKey: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY", defaultConfig.supabaseAnonKey),
}

// Export SERVER_URL for backward compatibility
export const SERVER_URL = config.serverUrl
