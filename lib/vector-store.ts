import { mem0Integration } from "./mem0-integration"

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
        this.apiEnabled = await mem0Integration.initialize()
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
        // Store the document content in mem0 as a memory
        await mem0Integration.addMemory(`Vector document: ${content}`, this.userId)

        // Also store metadata as structured data
        await mem0Integration.storeStructuredMemory(
          `vector-${id}`,
          {
            content,
            metadata,
            timestamp: Date.now(),
          },
          this.userId,
        )
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
        // Use mem0 search to find similar documents
        const results = await mem0Integration.searchMemories(`Vector document: ${query}`, this.userId, limit)

        // Convert memory results to vector items
        return results.results.map((item: any) => ({
          id: item.id || `mem0-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          content: item.memory.replace("Vector document: ", ""),
          metadata: item.metadata || {},
          timestamp: item.timestamp || Date.now(),
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
        const result = await mem0Integration.retrieveStructuredMemory<VectorItem>(`vector-${id}`, this.userId)
        if (result) {
          return {
            id,
            content: result.content,
            metadata: result.metadata,
            timestamp: result.timestamp,
          }
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
          await mem0Integration.storeStructuredMemory(
            `vector-${id}`,
            {
              content,
              metadata: updatedItem.metadata,
              timestamp: Date.now(),
            },
            this.userId,
          )

          // Also update the memory content
          // Note: This is a simplification - in a real implementation, you might
          // want to handle this differently to avoid duplication
          await mem0Integration.addMemory(`Vector document: ${content}`, this.userId)
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
        await mem0Integration.storeStructuredMemory(
          `vector-${id}`,
          { deleted: true, timestamp: Date.now() },
          this.userId,
        )
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

    // If API is available, try to get from there too and merge results
    if (!this.useLocalFallback && isBrowser) {
      try {
        // This is a simplified approach - in a real implementation,
        // you might want to use a more specific API call
        const results = await mem0Integration.searchMemories("Vector document:", this.userId, limit)

        // Convert and merge with local results
        const apiItems = results.results.map((item: any) => ({
          id: item.id || `mem0-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          content: item.memory.replace("Vector document: ", ""),
          metadata: item.metadata || {},
          timestamp: item.timestamp || Date.now(),
        }))

        // Merge and deduplicate
        const mergedItems = [...localItems]
        for (const apiItem of apiItems) {
          if (!mergedItems.some((item) => item.content === apiItem.content)) {
            mergedItems.push(apiItem)
          }
        }

        return mergedItems.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
      } catch (error) {
        console.error("Error getting all documents from Mem0 API:", error)
        // Fall back to local storage
      }
    }

    return localItems.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
  }

  async getDocumentsByTag(tag: string, limit = 100): Promise<VectorItem[]> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

    // Get from local storage first
    const localItems = (fallbackVectorStorage[this.userId] || [])
      .filter((item) => item.metadata?.tags?.includes(tag))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)

    // If API is available, try to get from there too
    if (!this.useLocalFallback && isBrowser) {
      try {
        // This is a simplified approach - in a real implementation,
        // you might want to use a more specific API call
        const results = await mem0Integration.searchMemories(`tag:${tag}`, this.userId, limit)

        // Convert and merge with local results
        const apiItems = results.results.map((item: any) => ({
          id: item.id || `mem0-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          content: item.memory.replace("Vector document: ", ""),
          metadata: item.metadata || {},
          timestamp: item.timestamp || Date.now(),
        }))

        // Merge and deduplicate
        const mergedItems = [...localItems]
        for (const apiItem of apiItems) {
          if (!mergedItems.some((item) => item.content === apiItem.content)) {
            mergedItems.push(apiItem)
          }
        }

        return mergedItems.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
      } catch (error) {
        console.error("Error getting documents by tag from Mem0 API:", error)
        // Fall back to local storage
      }
    }

    return localItems
  }

  async addTag(id: string, tag: string): Promise<boolean> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

    // Update in local storage
    const localItems = fallbackVectorStorage[this.userId] || []
    const itemIndex = localItems.findIndex((item) => item.id === id)

    if (itemIndex >= 0) {
      const item = localItems[itemIndex]
      const tags = item.metadata.tags || []

      if (!tags.includes(tag)) {
        const updatedMetadata = {
          ...item.metadata,
          tags: [...tags, tag],
        }

        localItems[itemIndex] = {
          ...item,
          metadata: updatedMetadata,
          timestamp: Date.now(),
        }

        // If API is available, update there too
        if (!this.useLocalFallback && isBrowser) {
          try {
            await mem0Integration.storeStructuredMemory(
              `vector-${id}`,
              {
                content: item.content,
                metadata: updatedMetadata,
                timestamp: Date.now(),
              },
              this.userId,
            )
          } catch (error) {
            console.error("Error updating tags in Mem0 API:", error)
          }
        }

        return true
      }
    }

    return false
  }

  async removeTag(id: string, tag: string): Promise<boolean> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

    // Update in local storage
    const localItems = fallbackVectorStorage[this.userId] || []
    const itemIndex = localItems.findIndex((item) => item.id === id)

    if (itemIndex >= 0) {
      const item = localItems[itemIndex]
      const tags = item.metadata.tags || []

      if (tags.includes(tag)) {
        const updatedMetadata = {
          ...item.metadata,
          tags: tags.filter((t) => t !== tag),
        }

        localItems[itemIndex] = {
          ...item,
          metadata: updatedMetadata,
          timestamp: Date.now(),
        }

        // If API is available, update there too
        if (!this.useLocalFallback && isBrowser) {
          try {
            await mem0Integration.storeStructuredMemory(
              `vector-${id}`,
              {
                content: item.content,
                metadata: updatedMetadata,
                timestamp: Date.now(),
              },
              this.userId,
            )
          } catch (error) {
            console.error("Error updating tags in Mem0 API:", error)
          }
        }

        return true
      }
    }

    return false
  }

  isUsingLocalFallback(): boolean {
    return this.useLocalFallback
  }
}

// Create a singleton instance
export const vectorStore = new VectorStore()
