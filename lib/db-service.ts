import { createClient } from "@supabase/supabase-js"
import { config } from "./config"

// Define types for our database tables
export interface FileRecord {
  id: string
  name: string
  path: string
  type: string
  size: number
  created_at: string
  updated_at: string
  user_id: string
  favorite: boolean
  tags: string[]
  access_count: number
}

export interface UserRecord {
  id: string
  username: string
  email: string
  created_at: string
}

export interface MemoryRecord {
  id: string
  user_id: string
  content: string
  metadata: Record<string, any>
  created_at: string
}

// In-memory fallback storage when database is unavailable
const fallbackFileStorage: Record<string, FileRecord[]> = {}
const fallbackMemoryStorage: Record<string, MemoryRecord[]> = {}

// Safe check for preview environment that works on both client and server
const isPreviewEnvironment = () => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    // Server-side - assume it's a preview if not in production
    return process.env.NODE_ENV !== "production"
  }

  // Client-side - check hostname and path
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname.includes("vercel.app") ||
    window.location.pathname.includes("/direct-entry")
  )
}

// Safe check for browser environment
const isBrowser = typeof window !== "undefined"

class DatabaseService {
  private supabase
  private initialized = false
  private useLocalFallback = isPreviewEnvironment() // Default to local fallback in preview
  private connectionAttempted = false

  constructor() {
    console.log(
      `DatabaseService initialized with useLocalFallback=${this.useLocalFallback} (preview=${isPreviewEnvironment()})`,
    )

    // Check if Supabase credentials are available
    if (this.useLocalFallback || !config.supabaseUrl || !config.supabaseAnonKey || !isBrowser) {
      if (!this.useLocalFallback && isBrowser) {
        console.warn("Supabase credentials not found. Using local fallback storage.")
      } else {
        console.warn("Preview environment detected or server-side rendering. Using local fallback storage.")
      }

      this.useLocalFallback = true
      // Create a dummy client to prevent errors
      this.supabase = {
        from: () => ({
          select: () => ({ data: null, error: new Error("Supabase not configured") }),
          insert: () => ({ data: null, error: new Error("Supabase not configured") }),
          update: () => ({ data: null, error: new Error("Supabase not configured") }),
          delete: () => ({ data: null, error: new Error("Supabase not configured") }),
          eq: () => ({ data: null, error: new Error("Supabase not configured") }),
          order: () => ({ data: null, error: new Error("Supabase not configured") }),
          limit: () => ({ data: null, error: new Error("Supabase not configured") }),
          single: () => ({ data: null, error: new Error("Supabase not configured") }),
        }),
        rpc: () => ({ data: null, error: new Error("Supabase not configured") }),
      }
    } else {
      // Create Supabase client
      try {
        if (isBrowser) {
          this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)
        } else {
          this.supabase = {
            from: () => ({
              select: () => ({ data: null, error: new Error("Supabase not configured") }),
              insert: () => ({ data: null, error: new Error("Supabase not configured") }),
              update: () => ({ data: null, error: new Error("Supabase not configured") }),
              delete: () => ({ data: null, error: new Error("Supabase not configured") }),
              eq: () => ({ data: null, error: new Error("Supabase not configured") }),
              order: () => ({ data: null, error: new Error("Supabase not configured") }),
              limit: () => ({ data: null, error: new Error("Supabase not configured") }),
              single: () => ({ data: null, error: new Error("Supabase not configured") }),
            }),
            rpc: () => ({ data: null, error: new Error("Supabase not configured") }),
          }
        }
      } catch (error) {
        console.error("Failed to create Supabase client:", error)
        this.useLocalFallback = true
        // Create a dummy client to prevent errors
        this.supabase = {
          from: () => ({
            select: () => ({ data: null, error: new Error("Supabase client creation failed") }),
            insert: () => ({ data: null, error: new Error("Supabase client creation failed") }),
            update: () => ({ data: null, error: new Error("Supabase client creation failed") }),
            delete: () => ({ data: null, error: new Error("Supabase client creation failed") }),
            eq: () => ({ data: null, error: new Error("Supabase client creation failed") }),
            order: () => ({ data: null, error: new Error("Supabase client creation failed") }),
            limit: () => ({ data: null, error: new Error("Supabase client creation failed") }),
            single: () => ({ data: null, error: new Error("Supabase client creation failed") }),
          }),
          rpc: () => ({ data: null, error: new Error("Supabase client creation failed") }),
        }
      }
    }
  }

  async initialize(): Promise<boolean> {
    if (this.initialized) return !this.useLocalFallback

    // Always use local fallback in preview or server-side
    if (isPreviewEnvironment() || !isBrowser) {
      this.useLocalFallback = true
      this.initialized = true
      console.log("Preview environment or server-side detected, using local fallback storage for database operations")
      return false
    }

    if (this.useLocalFallback) {
      this.initialized = true
      console.log("Using local fallback storage for database operations")
      return false
    }

    try {
      // Test the connection
      const { data, error } = await this.supabase.from("files").select("id").limit(1)

      if (error) {
        console.error("Database connection error:", error)
        this.useLocalFallback = true
        this.initialized = true
        console.log("Falling back to local storage for database operations")
        return false
      }

      this.initialized = true
      this.connectionAttempted = true
      console.log("Database connection established")
      return true
    } catch (error) {
      console.error("Failed to initialize database connection:", error)
      this.useLocalFallback = true
      this.initialized = true
      this.connectionAttempted = true
      console.log("Falling back to local storage for database operations")
      return false
    }
  }

  // Memory operations
  async storeMemory(userId: string, content: string, metadata: Record<string, any> = {}): Promise<MemoryRecord | null> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

    // Force local fallback in preview environment or server-side
    if (isPreviewEnvironment() || !isBrowser) {
      console.log("Preview environment or server-side detected, forcing local fallback storage for memory")
      this.useLocalFallback = true
    }

    // Always use local fallback in preview environment or server-side
    if (this.useLocalFallback) {
      console.log("Using local fallback storage for memory operations")
      if (!fallbackMemoryStorage[userId]) {
        fallbackMemoryStorage[userId] = []
      }

      const newMemory: MemoryRecord = {
        id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        user_id: userId,
        content,
        metadata: metadata || {}, // Ensure metadata is an object
        created_at: new Date().toISOString(),
      }

      fallbackMemoryStorage[userId].push(newMemory)
      return newMemory
    }

    // Only try database operations if not in fallback mode
    try {
      const { data, error } = await this.supabase
        .from("memories")
        .insert([
          {
            user_id: userId,
            content,
            metadata: metadata || {}, // Ensure metadata is an object
          },
        ])
        .select()
        .single()

      if (error) {
        // Extract and log detailed error information
        let errorDetails = "Unknown database error"

        if (error.message) {
          errorDetails = error.message
        } else if (error.code) {
          errorDetails = `Error code: ${error.code}`
        } else {
          try {
            errorDetails = JSON.stringify(error)
          } catch (e) {
            errorDetails = "Error object could not be stringified"
          }
        }

        console.error("Database error when storing memory:", errorDetails)

        // Switch to fallback mode for future operations
        this.useLocalFallback = true

        // Use local fallback storage
        if (!fallbackMemoryStorage[userId]) {
          fallbackMemoryStorage[userId] = []
        }

        const newMemory: MemoryRecord = {
          id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          user_id: userId,
          content,
          metadata: metadata || {},
          created_at: new Date().toISOString(),
        }

        fallbackMemoryStorage[userId].push(newMemory)
        return newMemory
      }

      return data
    } catch (error) {
      // Extract and log detailed error information
      let errorMessage = "Unknown error"

      if (error instanceof Error) {
        errorMessage = error.message || error.toString()
      } else if (typeof error === "string") {
        errorMessage = error
      } else {
        try {
          errorMessage = JSON.stringify(error)
        } catch (e) {
          errorMessage = "Error object could not be stringified"
        }
      }

      console.error("Exception when storing memory in database:", errorMessage)

      // Switch to fallback mode for future operations
      this.useLocalFallback = true

      // Use local fallback storage
      if (!fallbackMemoryStorage[userId]) {
        fallbackMemoryStorage[userId] = []
      }

      const newMemory: MemoryRecord = {
        id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        user_id: userId,
        content,
        metadata: metadata || {},
        created_at: new Date().toISOString(),
      }

      fallbackMemoryStorage[userId].push(newMemory)
      return newMemory
    }
  }

  isUsingLocalFallback(): boolean {
    return this.useLocalFallback || isPreviewEnvironment() || !isBrowser
  }
}

export const dbService = new DatabaseService()
