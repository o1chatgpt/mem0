import { serverConfig } from "./config"

// Mem0 client for interacting with the Mem0 API
class Mem0Client {
  private apiKey: string
  private apiUrl: string

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey
    this.apiUrl = apiUrl
  }

  async createMemory(content: string, metadata: any = {}) {
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
      throw error
    }
  }

  async getMemory(id: string) {
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
      throw error
    }
  }

  async searchMemories(query: string, limit = 10) {
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
      throw error
    }
  }

  async updateMemory(id: string, content: string, metadata: any = {}) {
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
      throw error
    }
  }

  async deleteMemory(id: string) {
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
      throw error
    }
  }
}

// Create and export an instance of the client
export const mem0Client = new Mem0Client(serverConfig.mem0ApiKey, serverConfig.mem0ApiUrl)

// Also export the class for extensibility
export default Mem0Client
