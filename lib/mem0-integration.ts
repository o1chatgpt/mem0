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

// Dynamic import for Mem0 client
class Mem0Integration {
  private memory: MemoryInterface
  private initialized = false
  private apiEnabled = false
  private apiKey: string
  private apiUrl: string

  constructor(apiKey = "", apiUrl = "https://api.mem0.ai") {
    this.apiKey = apiKey
    this.apiUrl = apiUrl
    this.memory = new LocalMemoryStore() // Default to local storage
  }

  async initialize(): Promise<boolean> {
    if (this.initialized) return this.apiEnabled

    if (!isBrowser) {
      console.log("Not in browser environment, using local storage")
      this.apiEnabled = false
      this.initialized = true
      return false
    }

    try {
      // Fetch API key from server endpoint
      const response = await fetch("/api/mem0/config")
      const data = await response.json()

      if (!data.apiKey) {
        console.log("Mem0 API key not found, using local storage")
        this.apiEnabled = false
        this.initialized = true
        return false
      }

      this.apiKey = data.apiKey
      this.apiUrl = data.apiUrl || this.apiUrl

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
            const memoryClient = new Memory(this.apiKey, { apiUrl: this.apiUrl })

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

  // Add file-specific memory methods
  async addFileMemory(
    filePath: string,
    content: string,
    userId: string,
    metadata: Record<string, any> = {},
  ): Promise<void> {
    const fileMemory = `File: ${filePath}\nContent: ${content}`
    await this.addMemory(fileMemory, userId, { ...metadata, type: "file", path: filePath })
  }

  async searchFileMemories(query: string, userId: string, limit = 5): Promise<any> {
    const results = await this.searchMemories(query, userId, limit)

    // Filter for file-related memories if needed
    // This is a simple implementation - the actual mem0 API might have better filtering
    return {
      ...results,
      results: results.results.filter((result: any) => result.memory && result.memory.startsWith("File:")),
    }
  }

  // Add folder navigation memory
  async addNavigationMemory(folderPath: string, userId: string): Promise<void> {
    await this.addMemory(`Navigated to folder: ${folderPath}`, userId, { type: "navigation", path: folderPath })
  }

  // Add search history memory
  async addSearchMemory(searchQuery: string, userId: string, results: number): Promise<void> {
    await this.addMemory(`Searched for: ${searchQuery} (${results} results)`, userId, {
      type: "search",
      query: searchQuery,
      resultCount: results,
    })
  }

  // Get user activity summary
  async getUserActivitySummary(userId: string): Promise<any> {
    if (!this.initialized) await this.initialize()

    if (!this.apiEnabled) {
      // Simplified local implementation
      return {
        recentFiles: [],
        recentFolders: [],
        recentSearches: [],
        totalMemories: 0,
      }
    }

    try {
      // In a real implementation, you might have a specific API for this
      // Here we're using the search API as an example
      const fileResults = await this.searchMemories("File:", userId, 5)
      const navigationResults = await this.searchMemories("Navigated to folder:", userId, 5)
      const searchResults = await this.searchMemories("Searched for:", userId, 5)

      return {
        recentFiles: fileResults.results || [],
        recentFolders: navigationResults.results || [],
        recentSearches: searchResults.results || [],
        totalMemories:
          (fileResults.results?.length || 0) +
          (navigationResults.results?.length || 0) +
          (searchResults.results?.length || 0),
      }
    } catch (error) {
      console.error("Error getting user activity summary:", error)
      return {
        recentFiles: [],
        recentFolders: [],
        recentSearches: [],
        totalMemories: 0,
      }
    }
  }
}

// Create a singleton instance without passing API key directly
export const mem0Integration = new Mem0Integration()
