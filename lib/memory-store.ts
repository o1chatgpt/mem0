"use client"

// Safe check for browser environment
const isBrowser = typeof window !== "undefined"

export class MemoryStore {
  private userId: string
  private initialized = false

  constructor(userId: string) {
    this.userId = userId
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    this.initialized = true
    console.log("Memory store initialized")
  }

  getStorageMode(): string {
    return "local"
  }

  async addMemory(memory: string): Promise<void> {
    if (!isBrowser) return

    try {
      const memories = this.getMemories()
      memories.push({
        text: memory,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem(`memories-${this.userId}`, JSON.stringify(memories))
    } catch (error) {
      console.error("Error storing memory:", error)
    }
  }

  getMemories(): Array<{ text: string; timestamp: string }> {
    if (!isBrowser) return []

    try {
      const stored = localStorage.getItem(`memories-${this.userId}`)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error retrieving memories:", error)
      return []
    }
  }

  async storeMemory<T>(key: string, data: T): Promise<void> {
    if (!isBrowser) return

    try {
      localStorage.setItem(`memory-${this.userId}-${key}`, JSON.stringify(data))
    } catch (error) {
      console.error(`Error storing memory for key ${key}:`, error)
    }
  }

  async retrieveMemory<T>(key: string): Promise<T | null> {
    if (!isBrowser) return null

    try {
      const data = localStorage.getItem(`memory-${this.userId}-${key}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error(`Error retrieving memory for key ${key}:`, error)
      return null
    }
  }

  async getFileTags(fileId: string): Promise<string[]> {
    try {
      return (await this.retrieveMemory<string[]>(`file-tags-${fileId}`)) || []
    } catch (error) {
      console.error("Error getting file tags:", error)
      return []
    }
  }

  async rememberTag(fileId: string, tag: string): Promise<void> {
    try {
      const tags = await this.getFileTags(fileId)
      if (!tags.includes(tag)) {
        await this.storeMemory(`file-tags-${fileId}`, [...tags, tag])
      }
    } catch (error) {
      console.error("Error remembering tag:", error)
    }
  }

  async removeTag(fileId: string, tag: string): Promise<void> {
    try {
      const tags = await this.getFileTags(fileId)
      await this.storeMemory(
        `file-tags-${fileId}`,
        tags.filter((t) => t !== tag),
      )
    } catch (error) {
      console.error("Error removing tag:", error)
    }
  }

  async toggleFavorite(fileId: string): Promise<boolean> {
    try {
      const favorites = (await this.retrieveMemory<string[]>("favorites")) || []
      const isFavorite = favorites.includes(fileId)

      if (isFavorite) {
        await this.storeMemory(
          "favorites",
          favorites.filter((id) => id !== fileId),
        )
      } else {
        await this.storeMemory("favorites", [...favorites, fileId])
      }

      return !isFavorite
    } catch (error) {
      console.error("Error toggling favorite:", error)
      return false
    }
  }

  async clearMemory(): Promise<void> {
    if (!isBrowser) return

    try {
      localStorage.removeItem(`memories-${this.userId}`)
    } catch (error) {
      console.error("Error clearing memory:", error)
    }
  }

  async getAllMemories(): Promise<any[]> {
    return this.getMemories()
  }
}

// Singleton pattern
let memoryStoreInstance: MemoryStore | null = null

export function getMemoryStore(userId = "default-user"): MemoryStore {
  if (!memoryStoreInstance) {
    memoryStoreInstance = new MemoryStore(userId)
    memoryStoreInstance.initialize().catch(console.error)
  }
  return memoryStoreInstance
}
