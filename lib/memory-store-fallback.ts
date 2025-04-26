// This file provides a fallback implementation for mem0-integration
// to avoid direct imports of the mem0ai module

// Safe check for browser environment
const isBrowser = typeof window !== "undefined"

// Interface for Memory operations
export interface MemoryInterface {
  add: (messages: Array<{ role: string; content: string }>, userId: string) => Promise<void>
  search: (query: string, userId: string, limit?: number) => Promise<any>
  storeMemory: <T>(key: string, data: T, userId: string) => Promise<void>
  retrieveMemory: <T>(key: string, userId: string) => Promise<T | null>
  clearMemory: (userId: string) => Promise<void>
}

// Fallback implementation that uses localStorage
class LocalMemoryStore implements MemoryInterface {
  async add(messages: Array<{ role: string; content: string }>, userId: string): Promise<void> {
    if (!isBrowser) return

    try {
      const key = `memory-messages-${userId}`
      const existing = localStorage.getItem(key)
      const existingMessages = existing ? JSON.parse(existing) : []

      localStorage.setItem(key, JSON.stringify([...existingMessages, ...messages]))
    } catch (error) {
      console.error("Error storing messages in local storage:", error)
    }
  }

  async search(query: string, userId: string, limit = 5): Promise<any> {
    if (!isBrowser) return { results: [] }

    try {
      const key = `memory-messages-${userId}`
      const existing = localStorage.getItem(key)
      const messages = existing ? JSON.parse(existing) : []

      // Simple search implementation
      const results = messages
        .filter((msg: any) => msg.content.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit)
        .map((msg: any, index: number) => ({
          id: `local-${index}`,
          memory: msg.content,
          timestamp: Date.now() - index * 1000 * 60 * 60, // Fake timestamps
        }))

      return { results }
    } catch (error) {
      console.error("Error searching in local storage:", error)
      return { results: [] }
    }
  }

  async storeMemory<T>(key: string, data: T, userId: string): Promise<void> {
    if (!isBrowser) return

    try {
      localStorage.setItem(`memory-${userId}-${key}`, JSON.stringify(data))
    } catch (error) {
      console.error(`Error storing memory for key ${key}:`, error)
    }
  }

  async retrieveMemory<T>(key: string, userId: string): Promise<T | null> {
    if (!isBrowser) return null

    try {
      const data = localStorage.getItem(`memory-${userId}-${key}`)
      return data ? (JSON.parse(data) as T) : null
    } catch (error) {
      console.error(`Error retrieving memory for key ${key}:`, error)
      return null
    }
  }

  async clearMemory(userId: string): Promise<void> {
    if (!isBrowser) return

    try {
      // Find all keys in localStorage that belong to this user
      const keysToRemove: string[] = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes(`-${userId}`)) {
          keysToRemove.push(key)
        }
      }

      // Remove all found keys
      keysToRemove.forEach((key) => localStorage.removeItem(key))
    } catch (error) {
      console.error(`Error clearing memory for user ${userId}:`, error)
    }
  }
}

// Fallback implementation for Mem0Integration
class Mem0IntegrationFallback {
  private memory: MemoryInterface
  private initialized = false
  private apiEnabled = false

  constructor() {
    this.memory = new LocalMemoryStore() // Always use local storage
    console.log("Using fallback memory implementation")
  }

  async initialize(): Promise<boolean> {
    this.initialized = true
    return false // Always return false to indicate API is not available
  }

  async addMemory(memory: string, userId: string): Promise<void> {
    await this.memory.add([{ role: "system", content: memory }], userId)
  }

  async searchMemories(query: string, userId: string, limit = 5): Promise<any> {
    return await this.memory.search(query, userId, limit)
  }

  async storeStructuredMemory<T>(key: string, data: T, userId: string): Promise<void> {
    await this.memory.storeMemory(key, data, userId)
  }

  async retrieveStructuredMemory<T>(key: string, userId: string): Promise<T | null> {
    return await this.memory.retrieveMemory(key, userId)
  }

  async clearMemories(userId: string): Promise<void> {
    await this.memory.clearMemory(userId)
  }

  isEnabled(): boolean {
    return false
  }
}

// Export the fallback implementation
export const mem0Integration = new Mem0IntegrationFallback()
