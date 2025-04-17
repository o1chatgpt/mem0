// Mem0 client for interacting with the Mem0 API
export class Mem0Client {
  private apiKey: string
  private apiUrl: string

  constructor(apiKey: string, apiUrl = "https://api.mem0.ai") {
    this.apiKey = apiKey
    this.apiUrl = apiUrl
  }

  // Search for memories
  async searchMemories(query: string, userId = "default_user", limit = 10) {
    try {
      const url = new URL(`${this.apiUrl}/memories/search`)
      url.searchParams.append("user_id", userId)
      url.searchParams.append("query", query)
      url.searchParams.append("limit", limit.toString())

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
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

  // Add a new memory
  async addMemory(content: string, userId = "default_user", metadata = {}) {
    try {
      const response = await fetch(`${this.apiUrl}/memories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          user_id: userId,
          memory: content,
          metadata,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to add memory: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error adding memory:", error)
      throw error
    }
  }

  // Get all memories for a user
  async getMemories(userId = "default_user", limit = 100) {
    try {
      const url = new URL(`${this.apiUrl}/memories`)
      url.searchParams.append("user_id", userId)
      url.searchParams.append("limit", limit.toString())

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get memories: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error getting memories:", error)
      throw error
    }
  }

  // Delete a memory
  async deleteMemory(memoryId: string) {
    try {
      const response = await fetch(`${this.apiUrl}/memories/${memoryId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
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
