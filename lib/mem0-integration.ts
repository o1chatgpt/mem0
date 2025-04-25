// Safe check for browser environment
const isBrowser = typeof window !== "undefined"

// Interface for Memory operations
export interface MemoryInterface {
  add: (messages: Array<{ role: string; content: string }>, userId: string) => Promise<void>
  search: (query: string, userId: string, limit?: number) => Promise<any>
  storeMemory: <T>(key: string, data: T, userId: string) => Promise<void>
  retrieveMemory: <T>(key: string, data: T, userId: string) => Promise<T | null>
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

// Dynamic import for Mem0 client
class Mem0Integration {
  private memory: MemoryInterface
  private initialized = false
  private apiEnabled = false
  private apiKey: string

  constructor(apiKey = "") {
    this.apiKey = apiKey
    this.memory = new LocalMemoryStore() // Default to local storage
  }

  async initialize(): Promise<boolean> {
    if (this.initialized) return this.apiEnabled

    if (!this.apiKey || !isBrowser) {
      console.log("Mem0 API key not found or not in browser environment, using local storage")
      this.apiEnabled = false
      this.initialized = true
      return false
    }

    try {
      // Dynamically import the mem0ai module only in browser environment
      if (isBrowser) {
        try {
          const mem0Module = await import("mem0ai")
            .then((module) => {
              if (!module) {
                console.warn("Failed to load mem0ai module")
                return null
              }
              return module
            })
            .catch((error) => {
              console.error("Failed to dynamically import mem0ai:", error)
              return null
            })

          if (mem0Module && mem0Module.Memory) {
            const Memory = mem0Module.Memory
            const memoryClient = new Memory(this.apiKey)

            // Test the connection
            await memoryClient.search({ query: "test", user_id: "test", limit: 1 }).catch(() => {
              throw new Error("Failed to connect to Mem0 API")
            })

            // If we get here, the connection was successful
            this.memory = {
              add: async (messages, userId) => {
                await memoryClient.add(messages, userId)
              },
              search: async (query, userId, limit = 5) => {
                return await memoryClient.search({ query, user_id: userId, limit })
              },
              storeMemory: async (key: string, data: any, userId: string) => {
                await memoryClient.storeMemory(key, data, userId)
              },
              retrieveMemory: async (key: string, userId: string) => {
                return await memoryClient.retrieveMemory(key, userId)
              },
              clearMemory: async (userId) => {
                return await memoryClient.clearMemory(userId)
              },
            }

            this.apiEnabled = true
            console.log("Mem0 integration initialized successfully")
          } else {
            console.warn("Mem0 module or Memory class not available after dynamic import")
            this.apiEnabled = false
          }
        } catch (error) {
          console.error("Failed to load mem0ai module:", error)
          this.apiEnabled = false
          // Continue with local storage
        }
      }

      this.initialized = true
      return this.apiEnabled
    } catch (error) {
      console.error("Failed to initialize Mem0 integration:", error)
      this.apiEnabled = false
      this.initialized = true
      return false
    }
  }

  async addMemory(memory: string, userId: string, metadata: Record<string, any> = {}): Promise<void> {
    if (!this.initialized) await this.initialize()

    try {
      await this.memory.add([{ role: "system", content: memory }], userId)
    } catch (error) {
      console.error("Error adding memory to Mem0:", error)
    }
  }

  async searchMemories(query: string, userId: string, limit = 5): Promise<any> {
    if (!this.initialized) await this.initialize()

    try {
      return await this.memory.search(query, userId, limit)
    } catch (error) {
      console.error("Error searching memories in Mem0:", error)
      return { results: [] }
    }
  }

  async storeStructuredMemory<T>(key: string, data: T, userId: string): Promise<void> {
    if (!this.initialized) await this.initialize()

    try {
      await this.memory.storeMemory(key, data, userId)
    } catch (error) {
      console.error("Error storing structured memory in Mem0:", error)
    }
  }

  async retrieveStructuredMemory<T>(key: string, userId: string): Promise<T | null> {
    if (!this.initialized) await this.initialize()

    try {
      return await this.memory.retrieveMemory(key, userId)
    } catch (error) {
      console.error("Error retrieving structured memory from Mem0:", error)
      return null
    }
  }

  async clearMemories(userId: string): Promise<void> {
    if (!this.initialized) await this.initialize()

    try {
      await this.memory.clearMemory(userId)
    } catch (error) {
      console.error("Error clearing memories in Mem0:", error)
    }
  }

  isEnabled(): boolean {
    return this.apiEnabled
  }
}

// Create a singleton instance with the API key from environment
export const mem0Integration = new Mem0Integration(process.env.MEM0_API_KEY || "")
