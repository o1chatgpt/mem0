import { serverConfig } from "./config"

// Mem0 client for interacting with the Mem0 API
class Mem0Client {
  private apiKey: string
  private apiUrl: string
  private isAvailable: boolean

  constructor() {
    this.apiKey = serverConfig.mem0ApiKey || ""
    this.apiUrl = serverConfig.mem0ApiUrl || "https://api.mem0.ai"
    this.isAvailable = !!this.apiKey
  }

  async createMemory(content: string, metadata: any = {}) {
    if (!this.isAvailable) {
      console.warn("Mem0 API is not available - API key is missing")
      return null
    }

    try {
      const response = await fetch(`${this.apiUrl}/memories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          content,
          metadata,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create memory: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating memory:", error)
      return null
    }
  }

  async getMemory(id: string) {
    if (!this.isAvailable) {
      console.warn("Mem0 API is not available - API key is missing")
      return null
    }

    try {
      const response = await fetch(`${this.apiUrl}/memories/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get memory: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error getting memory:", error)
      return null
    }
  }

  async searchMemories(query: string, limit = 10) {
    if (!this.isAvailable) {
      console.warn("Mem0 API is not available - API key is missing")
      return { results: [] }
    }

    try {
      const response = await fetch(`${this.apiUrl}/memories/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to search memories: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error searching memories:", error)
      return { results: [] }
    }
  }

  async updateMemory(id: string, content: string, metadata: any = {}) {
    if (!this.isAvailable) {
      console.warn("Mem0 API is not available - API key is missing")
      return null
    }

    try {
      const response = await fetch(`${this.apiUrl}/memories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          content,
          metadata,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update memory: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error updating memory:", error)
      return null
    }
  }

  async deleteMemory(id: string) {
    if (!this.isAvailable) {
      console.warn("Mem0 API is not available - API key is missing")
      return false
    }

    try {
      const response = await fetch(`${this.apiUrl}/memories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete memory: ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error("Error deleting memory:", error)
      return false
    }
  }

  isApiAvailable() {
    return this.isAvailable
  }
}

// Create and export an instance of the client
export const mem0Client = new Mem0Client()

// Also export the class for extensibility
export default Mem0Client
