import { createClient } from "@supabase/supabase-js"
import { config } from "./config"
import type { VectorEmbedding } from "./vector-store"

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

class DatabaseService {
  private supabase
  private initialized = false
  private useLocalFallback = true // Default to true to avoid errors

  constructor() {
    console.log("DatabaseService initialized with local fallback by default")

    // Check if Supabase credentials are available
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      console.warn("Supabase credentials not found. Using local fallback storage.")
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
        this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)
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
      console.log("Database connection established")
      return true
    } catch (error) {
      console.error("Failed to initialize database connection:", error)
      this.useLocalFallback = true
      this.initialized = true
      console.log("Falling back to local storage for database operations")
      return false
    }
  }

  // Files operations
  async getFiles(userId: string): Promise<FileRecord[]> {
    await this.initialize()

    if (this.useLocalFallback) {
      return fallbackFileStorage[userId] || []
    }

    const { data, error } = await this.supabase
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching files:", error)
      return []
    }

    return data || []
  }

  async getFilesByPath(userId: string, path: string): Promise<FileRecord[]> {
    await this.initialize()

    if (this.useLocalFallback) {
      return (fallbackFileStorage[userId] || []).filter((file) => file.path === path)
    }

    const { data, error } = await this.supabase.from("files").select("*").eq("user_id", userId).eq("path", path)

    if (error) {
      console.error("Error fetching files by path:", error)
      return []
    }

    return data || []
  }

  async getFileById(fileId: string): Promise<FileRecord | null> {
    await this.initialize()

    if (this.useLocalFallback) {
      for (const userId in fallbackFileStorage) {
        const file = fallbackFileStorage[userId].find((f) => f.id === fileId)
        if (file) return file
      }
      return null
    }

    const { data, error } = await this.supabase.from("files").select("*").eq("id", fileId).single()

    if (error) {
      console.error("Error fetching file by id:", error)
      return null
    }

    return data
  }

  async createFile(file: Omit<FileRecord, "id" | "created_at" | "updated_at">): Promise<FileRecord | null> {
    await this.initialize()

    if (this.useLocalFallback) {
      if (!fallbackFileStorage[file.user_id]) {
        fallbackFileStorage[file.user_id] = []
      }

      const newFile: FileRecord = {
        ...file,
        id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      fallbackFileStorage[file.user_id].push(newFile)
      return newFile
    }

    const { data, error } = await this.supabase.from("files").insert([file]).select().single()

    if (error) {
      console.error("Error creating file:", error)
      return null
    }

    return data
  }

  async updateFile(fileId: string, updates: Partial<FileRecord>): Promise<FileRecord | null> {
    await this.initialize()

    if (this.useLocalFallback) {
      for (const userId in fallbackFileStorage) {
        const fileIndex = fallbackFileStorage[userId].findIndex((f) => f.id === fileId)
        if (fileIndex >= 0) {
          const updatedFile = {
            ...fallbackFileStorage[userId][fileIndex],
            ...updates,
            updated_at: new Date().toISOString(),
          }
          fallbackFileStorage[userId][fileIndex] = updatedFile
          return updatedFile
        }
      }
      return null
    }

    const { data, error } = await this.supabase.from("files").update(updates).eq("id", fileId).select().single()

    if (error) {
      console.error("Error updating file:", error)
      return null
    }

    return data
  }

  async deleteFile(fileId: string): Promise<boolean> {
    await this.initialize()

    if (this.useLocalFallback) {
      for (const userId in fallbackFileStorage) {
        const initialLength = fallbackFileStorage[userId].length
        fallbackFileStorage[userId] = fallbackFileStorage[userId].filter((f) => f.id !== fileId)
        if (fallbackFileStorage[userId].length < initialLength) {
          return true
        }
      }
      return false
    }

    const { error } = await this.supabase.from("files").delete().eq("id", fileId)

    if (error) {
      console.error("Error deleting file:", error)
      return false
    }

    return true
  }

  async incrementFileAccessCount(fileId: string): Promise<void> {
    await this.initialize()

    if (this.useLocalFallback) {
      for (const userId in fallbackFileStorage) {
        const file = fallbackFileStorage[userId].find((f) => f.id === fileId)
        if (file) {
          file.access_count = (file.access_count || 0) + 1
          file.updated_at = new Date().toISOString()
        }
      }
      return
    }

    const { error } = await this.supabase.rpc("increment_file_access", {
      file_id: fileId,
    })

    if (error) {
      console.error("Error incrementing file access count:", error)
    }
  }

  async getFavoriteFiles(userId: string): Promise<FileRecord[]> {
    await this.initialize()

    if (this.useLocalFallback) {
      return (fallbackFileStorage[userId] || []).filter((file) => file.favorite)
    }

    const { data, error } = await this.supabase
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .eq("favorite", true)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching favorite files:", error)
      return []
    }

    return data || []
  }

  async getFrequentFiles(userId: string, limit = 10): Promise<FileRecord[]> {
    await this.initialize()

    if (this.useLocalFallback) {
      return (fallbackFileStorage[userId] || [])
        .sort((a, b) => (b.access_count || 0) - (a.access_count || 0))
        .slice(0, limit)
    }

    const { data, error } = await this.supabase
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .order("access_count", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching frequent files:", error)
      return []
    }

    return data || []
  }

  async getRecentFiles(userId: string, limit = 10): Promise<FileRecord[]> {
    await this.initialize()

    if (this.useLocalFallback) {
      return (fallbackFileStorage[userId] || [])
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, limit)
    }

    const { data, error } = await this.supabase
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching recent files:", error)
      return []
    }

    return data || []
  }

  // Memory operations
  async storeMemory(userId: string, content: string, metadata: Record<string, any> = {}): Promise<MemoryRecord | null> {
    try {
      // Ensure initialization
      await this.initialize()

      // Always use local fallback in preview environment to avoid database errors
      if (this.useLocalFallback || process.env.NODE_ENV === "development") {
        return this.storeMemoryLocally(userId, content, metadata)
      }

      // Check if the memories table exists
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
          console.error("Error storing memory in database:", error)
          // Fall back to local storage
          return this.storeMemoryLocally(userId, content, metadata)
        }

        return data
      } catch (dbError) {
        console.error("Database error when storing memory:", dbError)
        // Fall back to local storage
        return this.storeMemoryLocally(userId, content, metadata)
      }
    } catch (error) {
      console.error("Error in storeMemory:", error)
      // Fall back to local storage as a last resort
      return this.storeMemoryLocally(userId, content, metadata)
    }
  }

  // Helper method to store memory locally
  private storeMemoryLocally(userId: string, content: string, metadata: Record<string, any> = {}): MemoryRecord {
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

  async searchMemories(userId: string, query: string, limit = 10): Promise<MemoryRecord[]> {
    try {
      await this.initialize()

      if (this.useLocalFallback) {
        return (fallbackMemoryStorage[userId] || [])
          .filter((memory) => memory.content.toLowerCase().includes(query.toLowerCase()))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit)
      }

      // This assumes you have full-text search set up in your Supabase instance
      try {
        const { data, error } = await this.supabase
          .from("memories")
          .select("*")
          .eq("user_id", userId)
          .textSearch("content", query)
          .limit(limit)

        if (error) {
          console.error("Error searching memories in database:", error)
          // Fall back to local search
          return this.searchMemoriesLocally(userId, query, limit)
        }

        return data || []
      } catch (dbError) {
        console.error("Database error when searching memories:", dbError)
        // Fall back to local search
        return this.searchMemoriesLocally(userId, query, limit)
      }
    } catch (error) {
      console.error("Error in searchMemories:", error)
      // Fall back to local search as a last resort
      return this.searchMemoriesLocally(userId, query, limit)
    }
  }

  // Helper method to search memories locally
  private searchMemoriesLocally(userId: string, query: string, limit = 10): MemoryRecord[] {
    return (fallbackMemoryStorage[userId] || [])
      .filter((memory) => memory.content.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }

  async getRecentMemories(userId: string, limit = 10): Promise<MemoryRecord[]> {
    try {
      await this.initialize()

      if (this.useLocalFallback) {
        return (fallbackMemoryStorage[userId] || [])
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit)
      }

      const { data, error } = await this.supabase
        .from("memories")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching recent memories:", error)
        // Fall back to local storage
        return (fallbackMemoryStorage[userId] || [])
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit)
      }

      return data || []
    } catch (error) {
      console.error("Error in getRecentMemories:", error)
      // Fall back to local storage as a last resort
      return (fallbackMemoryStorage[userId] || [])
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit)
    }
  }

  async clearMemories(userId: string): Promise<boolean> {
    try {
      await this.initialize()

      if (this.useLocalFallback) {
        fallbackMemoryStorage[userId] = []
        return true
      }

      const { error } = await this.supabase.from("memories").delete().eq("user_id", userId)

      if (error) {
        console.error("Error clearing memories:", error)
        // Still clear local fallback storage
        fallbackMemoryStorage[userId] = []
        return false
      }

      return true
    } catch (error) {
      console.error("Error in clearMemories:", error)
      // Still clear local fallback storage
      fallbackMemoryStorage[userId] = []
      return false
    }
  }

  async storeVectorEmbedding(embedding: VectorEmbedding): Promise<boolean> {
    if (this.useLocalFallback) return false

    try {
      const { error } = await this.supabase.from("vector_embeddings").insert([
        {
          id: embedding.id,
          vector: embedding.vector,
          metadata: embedding.metadata,
          text: embedding.text,
          user_id: embedding.userId,
          created_at: embedding.createdAt,
        },
      ])

      if (error) {
        console.error("Error storing vector embedding:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error storing vector embedding:", error)
      return false
    }
  }

  async getVectorEmbedding(id: string): Promise<VectorEmbedding | null> {
    if (this.useLocalFallback) return null

    try {
      const { data, error } = await this.supabase.from("vector_embeddings").select("*").eq("id", id).single()

      if (error || !data) {
        console.error("Error getting vector embedding:", error)
        return null
      }

      return {
        id: data.id,
        vector: data.vector,
        metadata: data.metadata,
        text: data.text,
        userId: data.user_id,
        createdAt: data.created_at,
      }
    } catch (error) {
      console.error("Error getting vector embedding:", error)
      return null
    }
  }

  async searchVectorEmbeddings(
    userId: string,
    queryVector: number[],
    limit = 5,
    threshold = 0.7,
  ): Promise<VectorEmbedding[]> {
    if (this.useLocalFallback) return []

    try {
      // This assumes you have a stored procedure or function in your database
      // that can calculate vector similarity. This is a simplified example.
      const { data, error } = await this.supabase.rpc("search_vector_embeddings", {
        query_vector: queryVector,
        user_id: userId,
        similarity_threshold: threshold,
        match_limit: limit,
      })

      if (error) {
        console.error("Error searching vector embeddings:", error)
        return []
      }

      return (data || []).map((item) => ({
        id: item.id,
        vector: item.vector,
        metadata: item.metadata,
        text: item.text,
        userId: item.user_id,
        createdAt: item.created_at,
      }))
    } catch (error) {
      console.error("Error searching vector embeddings:", error)
      return []
    }
  }

  async deleteVectorEmbedding(id: string): Promise<boolean> {
    if (this.useLocalFallback) return false

    try {
      const { error } = await this.supabase.from("vector_embeddings").delete().eq("id", id)

      if (error) {
        console.error("Error deleting vector embedding:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error deleting vector embedding:", error)
      return false
    }
  }

  async clearVectorEmbeddings(userId: string): Promise<boolean> {
    if (this.useLocalFallback) return false

    try {
      const { error } = await this.supabase.from("vector_embeddings").delete().eq("user_id", userId)

      if (error) {
        console.error("Error clearing vector embeddings:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error clearing vector embeddings:", error)
      return false
    }
  }

  isUsingLocalFallback(): boolean {
    return this.useLocalFallback
  }
}

export const dbService = new DatabaseService()
