// API Keys and URLs
export const MEM0_API_KEY = process.env.MEM0_API_KEY || ""
export const MEM0_API_URL = process.env.MEM0_API_URL || "https://api.mem0.ai"

// File types and extensions
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/json",
  "text/csv",
  "application/zip",
  "video/mp4",
  "audio/mpeg",
]

export const MAX_FILE_SIZE = Number.parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE || "10485760", 10) // 10MB default

// UI Constants
export const SIDEBAR_WIDTH = 280
export const TOPBAR_HEIGHT = 60

// Pagination
export const ITEMS_PER_PAGE = 20

// App settings
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "File Manager"
export const ENABLE_DEMO_MODE = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true"
export const ENABLE_FILE_OPERATIONS = process.env.NEXT_PUBLIC_ENABLE_FILE_OPERATIONS === "true"
