"use client"

import { mem0Integration } from "./mem0-integration"

// Safe check for browser environment
const isBrowser = typeof window !== "undefined"

export class MemoryStore {
  private userId: string
  private apiEnabled = false
  private memories: { text: string; timestamp: string }[] = []
  private storageMode: "mem0" | "local" = "local"

  constructor(userId = "default-user") {
    this.userId = userId
  }

  async initialize(): Promise<void> {
    try {
      // Initialize mem0 integration
      const mem0Enabled = await mem0Integration.initialize()
      this.apiEnabled = mem0Enabled
      this.storageMode = mem0Enabled ? "mem0" : "local"

      // Load initial data from localStorage
      if (isBrowser) {
        const storedMemories = localStorage.getItem(`memories-${this.userId}`)
        if (storedMemories) {
          this.memories = JSON.parse(storedMemories)
        }
      }
    } catch (error) {
      console.error("Error initializing memory store:", error)
    }
  }

  async addMemory(memory: string): Promise<void> {
    const newMemory = {
      text: memory,
      timestamp: new Date().toISOString(),
    }

    this.memories = [newMemory, ...this.memories]

    if (isBrowser) {
      localStorage.setItem(`memories-${this.userId}`, JSON.stringify(this.memories))
    }

    if (this.apiEnabled) {
      try {
        await mem0Integration.addMemory(memory, this.userId)
      } catch (error) {
        console.warn("Failed to add memory to mem0:", error)
      }
    }
  }

  getMemories(): { text: string; timestamp: string }[] {
    return [...this.memories]
  }

  async storeMemory<T>(key: string, data: T): Promise<void> {
    if (isBrowser) {
      localStorage.setItem(`memory-${this.userId}-${key}`, JSON.stringify(data))
    }

    if (this.apiEnabled) {
      try {
        await mem0Integration.storeStructuredMemory(key, data, this.userId)
      } catch (error) {
        console.warn(`Failed to store structured memory for key ${key}:`, error)
      }
    }
  }

  async retrieveMemory<T>(key: string): Promise<T | null> {
    if (isBrowser) {
      const data = localStorage.getItem(`memory-${this.userId}-${key}`)
      return data ? (JSON.parse(data) as T) : null
    }

    if (this.apiEnabled) {
      try {
        return await mem0Integration.retrieveStructuredMemory(key, this.userId)
      } catch (error) {
        console.warn(`Failed to retrieve structured memory for key ${key}:`, error)
        return null
      }
    }

    return null
  }

  async clearMemory(): Promise<void> {
    this.memories = []
    if (isBrowser) {
      localStorage.removeItem(`memories-${this.userId}`)
    }

    if (this.apiEnabled) {
      try {
        await mem0Integration.clearMemories(this.userId)
      } catch (error) {
        console.warn("Failed to clear memories in mem0:", error)
      }
    }
  }

  async rememberTag(fileId: string, tag: string): Promise<void> {
    try {
      const existingTags = await this.getFileTags(fileId)
      if (!existingTags.includes(tag)) {
        const updatedTags = [...existingTags, tag]
        await this.storeMemory(`file-tags-${fileId}`, updatedTags)
      }
    } catch (error) {
      console.error("Error remembering tag:", error)
    }
  }

  async getFileTags(fileId: string): Promise<string[]> {
    try {
      const tags = (await this.retrieveMemory<string[]>(`file-tags-${fileId}`)) || []
      return tags
    } catch (error) {
      console.error("Error getting file tags:", error)
      return []
    }
  }

  async removeTag(fileId: string, tag: string): Promise<void> {
    try {
      const existingTags = await this.getFileTags(fileId)
      const updatedTags = existingTags.filter((t) => t !== tag)
      await this.storeMemory(`file-tags-${fileId}`, updatedTags)
    } catch (error) {
      console.error("Error removing tag:", error)
    }
  }

  getStorageMode(): string {
    return this.storageMode
  }

  async toggleFavorite(fileId: string): Promise<boolean> {
    try {
      const currentFavorites = (await this.retrieveMemory<string[]>("favorites")) || []
      let updatedFavorites: string[]

      if (currentFavorites.includes(fileId)) {
        updatedFavorites = currentFavorites.filter((id) => id !== fileId)
      } else {
        updatedFavorites = [...currentFavorites, fileId]
      }

      await this.storeMemory("favorites", updatedFavorites)
      return !currentFavorites.includes(fileId) // Return new favorite status
    } catch (error) {
      console.error("Error toggling favorite:", error)
      return false
    }
  }

  async getAllMemories(): Promise<any[]> {
    // In a real implementation, this would query a database or external API
    // For this example, we'll just return the local memories
    return [...this.memories]
  }
}

// Function to get or create a memory store instance
let memoryStoreInstance: MemoryStore | null = null

export async function getMemoryStore(userId = "default-user"): Promise<MemoryStore> {
  if (!memoryStoreInstance) {
    memoryStoreInstance = new MemoryStore(userId)
    await memoryStoreInstance.initialize()
  }
  return memoryStoreInstance
}
