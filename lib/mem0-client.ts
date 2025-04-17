import { serverConfig } from "./config"

// Mem0 client for interacting with the Mem0 API
export class Memory {
  private apiKey: string
  private apiUrl: string
  private isAvailable: boolean

  constructor() {
    this.apiKey = serverConfig.mem0ApiKey || ""
    this.apiUrl = serverConfig.mem0ApiUrl || "https://api.mem0.ai"
    this.isAvailable = !!this.apiKey
  }

  async add(messages: { role: string; content: string }[], userId: string) {
    "use server"

    if (!this.isAvailable) {
      console.warn("Mem0 API is not available - API key is missing")
      return null
    }

    try {
      const response = await fetch(`${this.apiUrl}/v1/memory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messages,
          user_id: userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to add memory: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error adding memory:", error)
      return null
    }
  }

  async search(options: { query: string; user_id: string; limit: number }) {
    "use server"

    if (!this.isAvailable) {
      console.warn("Mem0 API is not available - API key is missing")
      return { results: [] }
    }

    try {
      const response = await fetch(
        `${this.apiUrl}/v1/memory/search?q=${encodeURIComponent(options.query)}&user_id=${encodeURIComponent(
          options.user_id,
        )}&limit=${options.limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to search memories: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error searching memories:", error)
      return { results: [] }
    }
  }

  async storeMemory<T>(key: string, data: T, userId: string): Promise<void> {
    "use server"

    if (!this.isAvailable) {
      console.warn("Mem0 API is not available - API key is missing")
      return
    }

    try {
      const response = await fetch(`${this.apiUrl}/v1/memory/structured`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          key,
          data,
          user_id: userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to store structured memory: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error storing structured memory:", error)
    }
  }

  async retrieveMemory<T>(key: string, userId: string): Promise<T | null> {
    "use server"

    if (!this.isAvailable) {
      console.warn("Mem0 API is not available - API key is missing")
      return null
    }

    try {
      const response = await fetch(`${this.apiUrl}/v1/memory/structured?key=${key}&user_id=${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null // Memory not found
        }
        throw new Error(`Failed to retrieve structured memory: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data as T
    } catch (error) {
      console.error("Error retrieving structured memory:", error)
      return null
    }
  }

  async clearMemory(userId: string): Promise<void> {
    "use server"

    if (!this.isAvailable) {
      console.warn("Mem0 API is not available - API key is missing")
      return
    }

    try {
      const response = await fetch(`${this.apiUrl}/v1/memory?user_id=${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to clear memory: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error clearing memory:", error)
    }
  }

  isApiAvailable() {
    return this.isAvailable
  }

  isStructuredEndpointAvailable() {
    return this.isAvailable // Assuming same API key enables both endpoints
  }
}

// Create and export singleton instance
export const mem0Client = new Memory()
