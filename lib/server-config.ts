// Server-side only configuration
// This file should only be imported in server components or API routes

// Use a default value that doesn't rely on environment variables during build time
const getJwtSecret = () => {
  return process.env.JWT_SECRET || process.env.ANDIEGOGIAP_API_KEY || "default-secret-key"
}

const getAdminApiKey = () => {
  return process.env.ADMIN_API_KEY || process.env.ANDIEGOGIAP_API_KEY || "admin"
}

export const serverConfig = {
  // Admin credentials - for server-side authentication only
  adminApiKey: getAdminApiKey(),

  // Other sensitive configuration that should never be exposed to the client
  jwtSecret: getJwtSecret(),
}
