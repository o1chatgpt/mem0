"use client"

import { mem0Integration } from "./memory-store-fallback"

// Safe check for browser environment
const isBrowser = typeof window !== "undefined"

export class MemoryStore {
  private userId: string
  private initialized = false
  private mem0Enabled = false
  private syncEnabled = false

  constructor(userId: string) {
    this.userId = userId
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Try to initialize Mem0 integration
      this.mem0Enabled = await mem0Integration.initialize()
      console.log(`Memory store initialized with Mem0 ${this.mem0Enabled ? "enabled" : "disabled"}`)
    } catch (error) {
      console.error("Error initializing Mem0:", error)
      this.mem0Enabled = false
    }

    this.initialized = true
  }

  // Add the missing getStorageMode method
  getStorageMode(): string {
    return this.mem0Enabled ? "mem0" : "local"
  }

  async addMemory(memory: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }

    // Skip if not in browser environment
    if (!isBrowser) return

    // Store in Mem0 if available
    if (this.mem0Enabled) {
      try {
        await mem0Integration.addMemory(memory, this.userId)
      } catch (error) {
        console.error("Error adding memory to Mem0:", error)
      }
    }

    // Always store in localStorage as fallback
    try {
      const memories = this.getMemories()
      memories.push({
        id: `local-${Date.now()}`,
        text: memory,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem(`memories-${this.userId}`, JSON.stringify(memories))
    } catch (error) {
      console.error("Error storing memory in localStorage:", error)
    }
  }

  async storeMemory<T>(key: string, data: T): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }

    // Skip if not in browser environment
    if (!isBrowser) return

    // Store in Mem0 if available
    if (this.mem0Enabled) {
      try {
        await mem0Integration.storeStructuredMemory(key, data, this.userId)
      } catch (error) {
        console.error(`Error storing memory for key ${key} in Mem0:`, error)
      }
    }

    // Always store in localStorage as fallback
    try {
      localStorage.setItem(`memory-${this.userId}-${key}`, JSON.stringify(data))
    } catch (error) {
      console.error(`Error storing memory for key ${key} in localStorage:`, error)
    }
  }

  async retrieveMemory<T>(key: string): Promise<T | null> {
    if (!this.initialized) {
      await this.initialize()
    }

    // Skip if not in browser environment
    if (!isBrowser) return null

    // Try to retrieve from Mem0 first if available
    if (this.mem0Enabled) {
      try {
        const data = await mem0Integration.retrieveStructuredMemory<T>(key, this.userId)
        if (data) return data
      } catch (error) {
        console.error(`Error retrieving memory for key ${key} from Mem0:`, error)
      }
    }

    // Fall back to localStorage
    try {
      const data = localStorage.getItem(`memory-${this.userId}-${key}`)
      return data ? (JSON.parse(data) as T) : null
    } catch (error) {
      console.error(`Error retrieving memory for key ${key} from localStorage:`, error)
      return null
    }
  }

  getMemories(): { id: string; text: string; timestamp: string }[] {
    // Skip if not in browser environment
    if (!isBrowser) return []

    try {
      const memories = localStorage.getItem(`memories-${this.userId}`)
      return memories ? JSON.parse(memories) : []
    } catch (error) {
      console.error("Error getting memories from localStorage:", error)
      return []
    }
  }

  async getFileTags(fileId: string): Promise<string[]> {
    // Skip if not in browser environment
    if (!isBrowser) return []

    try {
      const tags = await this.retrieveMemory<string[]>(`file-tags-${fileId}`)
      return tags || []
    } catch (error) {
      console.error("Error retrieving file tags:", error)
      return []
    }
  }

  // Add the missing rememberTag method
  async rememberTag(fileId: string, tag: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }

    // Skip if not in browser environment
    if (!isBrowser) return

    try {
      // Get existing tags for the file
      const existingTags = await this.getFileTags(fileId)

      // Add the new tag if it doesn't already exist
      if (!existingTags.includes(tag)) {
        const updatedTags = [...existingTags, tag]

        // Store the updated tags
        await this.storeMemory(`file-tags-${fileId}`, updatedTags)

        // Also add a memory about this action
        await this.addMemory(`Added tag "${tag}" to file with ID ${fileId}`)
      }
    } catch (error) {
      console.error(`Error remembering tag for file ${fileId}:`, error)
      throw error
    }
  }

  // Add method to remove a tag
  async removeTag(fileId: string, tag: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }

    // Skip if not in browser environment
    if (!isBrowser) return

    try {
      // Get existing tags for the file
      const existingTags = await this.getFileTags(fileId)

      // Remove the tag if it exists
      if (existingTags.includes(tag)) {
        const updatedTags = existingTags.filter((t) => t !== tag)

        // Store the updated tags
        await this.storeMemory(`file-tags-${fileId}`, updatedTags)

        // Also add a memory about this action
        await this.addMemory(`Removed tag "${tag}" from file with ID ${fileId}`)
      }
    } catch (error) {
      console.error(`Error removing tag for file ${fileId}:`, error)
      throw error
    }
  }

  isInitialized(): boolean {
    return this.initialized
  }

  // Add method to toggle favorite status
  async toggleFavorite(fileId: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize()
    }

    // Skip if not in browser environment
    if (!isBrowser) return false

    try {
      // Get current favorites
      const favorites = (await this.retrieveMemory<string[]>("favorites")) || []

      // Check if file is already a favorite
      const isFavorite = favorites.includes(fileId)

      // Toggle favorite status
      let updatedFavorites: string[]
      if (isFavorite) {
        updatedFavorites = favorites.filter((id) => id !== fileId)
        await this.addMemory(`Removed file ${fileId} from favorites`)
      } else {
        updatedFavorites = [...favorites, fileId]
        await this.addMemory(`Added file ${fileId} to favorites`)
      }

      // Store updated favorites
      await this.storeMemory("favorites", updatedFavorites)

      // Return new favorite status
      return !isFavorite
    } catch (error) {
      console.error(`Error toggling favorite for file ${fileId}:`, error)
      throw error
    }
  }

  // Add method to clear memory
  async clearMemory(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }

    // Skip if not in browser environment
    if (!isBrowser) return

    try {
      // Clear Mem0 memories if available
      if (this.mem0Enabled) {
        try {
          await mem0Integration.clearMemories(this.userId)
        } catch (error) {
          console.error("Error clearing Mem0 memories:", error)
        }
      }

      // Clear all localStorage items for this user
      const keysToRemove: string[] = []

      // Find all keys in localStorage that belong to this user
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes(`-${this.userId}`)) {
          keysToRemove.push(key)
        }
      }

      // Remove all found keys
      keysToRemove.forEach((key) => localStorage.removeItem(key))

      // Also remove memories
      localStorage.removeItem(`memories-${this.userId}`)

      console.log(`Cleared memory for user ${this.userId}`)
    } catch (error) {
      console.error(`Error clearing memory for user ${this.userId}:`, error)
      throw error
    }
  }
}
