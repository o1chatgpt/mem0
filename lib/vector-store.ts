import { mem0Client } from "./mem0-client"

// Define types for vector data
export interface VectorItem {
  id: string
  content: string
  metadata: Record<string, any>
  embedding?: number[]
  timestamp: number
}

// In-memory fallback storage when vector database is unavailable
const fallbackVectorStorage: Record<string, VectorItem[]> = {}

// Safe check for browser environment
const isBrowser = typeof window !== "undefined"

export class VectorStore {
  private userId: string
  private useLocalFallback = true
  private initialized = false
  private apiEnabled = false

  constructor(userId = "default-user") {
    this.userId = userId
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      // Check if we're in a preview environment or server-side
      const isPreviewEnvironment =
        !isBrowser ||
        (isBrowser && (window.location.hostname === "localhost" || window.location.hostname.includes("vercel.app")))

      // Always use local fallback in preview or server-side
      if (isPreviewEnvironment) {
        this.useLocalFallback = true
        console.log("Preview environment or server-side detected, using local vector storage")
      } else {
        // Check if Mem0 API is available for vector operations
        this.apiEnabled = mem0Client.isApiAvailable()
        this.useLocalFallback = !this.apiEnabled
      }

      console.log(`Vector store initialized with ${this.apiEnabled ? "Mem0 API" : "local storage"}`)
      this.initialized = true
    } catch (error) {
      console.error("Error initializing vector store:", error)
      this.useLocalFallback = true
      this.initialized = true
    }
  }

  async addDocument(content: string, metadata: Record<string, any> = {}): Promise<string> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

    // Generate a unique ID
    const id = `vector-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // Always store locally first as fallback
    if (!fallbackVectorStorage[this.userId]) {
      fallbackVectorStorage[this.userId] = []
    }

    const vectorItem: VectorItem = {
      id,
      content,
      metadata: metadata || {},
      timestamp: Date.now(),
    }

    fallbackVectorStorage[this.userId].push(vectorItem)

    // If API is available, store there too
    if (!this.useLocalFallback && isBrowser) {
      try {
        // This would be replaced with actual vector embedding API call
        // For now, we'll just simulate it by storing in Mem0
        await mem0Client.add([{ role: "system", content: `Vector document: ${content}` }], this.userId)

        // Also store metadata as structured data
        await mem0Client.storeMemory(this.userId, `vector-${id}`, { content, metadata, timestamp: Date.now() })
      } catch (error) {
        console.error("Error storing vector in Mem0 API:", error)
      }
    }

    return id
  }

  async searchSimilar(query: string, limit = 5): Promise<VectorItem[]> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

    if (!this.useLocalFallback && isBrowser) {
      try {
        // This would be replaced with actual vector similarity search
        // For now, we'll just use regular memory search
        const results = await mem0Client.search(query, this.userId, limit)

        // Convert memory results to vector items
        return results.results.map((item) => ({
          id: item.id,
          content: item.memory.replace("Vector document: ", ""),
          metadata: item.metadata || {},
          timestamp: item.timestamp,
        }))
      } catch (error) {
        console.error("Error searching vectors from Mem0 API:", error)
        // Fall back to local search
      }
    }

    // Simple local search implementation (not actual vector similarity)
    const vectors = fallbackVectorStorage[this.userId] || []

    // Basic keyword matching (not real vector search)
    return vectors
      .filter((item) => item.content.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  async getDocumentById(id: string): Promise<VectorItem | null> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

    // Check local storage first
    const localItem = (fallbackVectorStorage[this.userId] || []).find((item) => item.id === id)

    if (localItem) {
      return localItem
    }

    // If not found locally and API is available, try there
    if (!this.useLocalFallback && isBrowser) {
      try {
        const result = await mem0Client.retrieveMemory<VectorItem>(this.userId, `vector-${id}`)
        if (result) {
          return result
        }
      } catch (error) {
        console.error("Error retrieving vector from Mem0 API:", error)
      }
    }

    return null
  }

  async updateDocument(id: string, content: string, metadata?: Record<string, any>): Promise<boolean> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

    // Update in local storage
    const localItems = fallbackVectorStorage[this.userId] || []
    const itemIndex = localItems.findIndex((item) => item.id === id)

    if (itemIndex >= 0) {
      const updatedItem = {
        ...localItems[itemIndex],
        content,
        ...(metadata && { metadata }),
        timestamp: Date.now(),
      }

      localItems[itemIndex] = updatedItem

      // If API is available, update there too
      if (!this.useLocalFallback && isBrowser) {
        try {
          // Update in Mem0
          await mem0Client.storeMemory(this.userId, `vector-${id}`, updatedItem)
        } catch (error) {
          console.error("Error updating vector in Mem0 API:", error)
        }
      }

      return true
    }

    return false
  }

  async deleteDocument(id: string): Promise<boolean> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

    // Delete from local storage
    const localItems = fallbackVectorStorage[this.userId] || []
    const initialLength = localItems.length

    fallbackVectorStorage[this.userId] = localItems.filter((item) => item.id !== id)

    const deleted = fallbackVectorStorage[this.userId].length < initialLength

    // If API is available, try to delete there too
    // Note: Mem0 doesn't have a direct delete API for structured data
    // so we'll just overwrite with an empty object
    if (!this.useLocalFallback && deleted && isBrowser) {
      try {
        await mem0Client.storeMemory(this.userId, `vector-${id}`, { deleted: true, timestamp: Date.now() })
      } catch (error) {
        console.error("Error marking vector as deleted in Mem0 API:", error)
      }
    }

    return deleted
  }

  async getAllDocuments(limit = 100): Promise<VectorItem[]> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

    // Get from local storage
    const localItems = fallbackVectorStorage[this.userId] || []

    return localItems.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
  }

  isUsingLocalFallback(): boolean {
    return this.useLocalFallback
  }
}

// Create a singleton instance
export const vectorStore = new VectorStore()
