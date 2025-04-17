interface MemorySearchResult {
  results: Array<{
    memory: string
    relevance: number
    created_at: string
  }>
}

export class Mem0Service {
  private apiKey: string
  private apiUrl: string

  constructor() {
    this.apiKey = process.env.MEM0_API_KEY || ""
    this.apiUrl = process.env.MEM0_API_URL || "https://api.mem0.ai"
  }

  async addMemory(userId: string, memory: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/memories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          user_id: userId,
          memory: memory,
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Error adding memory:", error)
      return false
    }
  }

  async searchMemories(userId: string, query: string, limit = 5): Promise<MemorySearchResult> {
    try {
      // Check if API key is available
      if (!this.apiKey) {
        console.warn("MEM0_API_KEY is not set. Returning empty results.")
        return { results: [] }
      }

      const response = await fetch(`${this.apiUrl}/memories/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          user_id: userId,
          query: query,
          limit: limit,
        }),
      })

      if (!response.ok) {
        console.warn(`Failed to search memories: ${response.statusText}`)
        return { results: [] }
      }

      return await response.json()
    } catch (error) {
      console.error("Error searching memories:", error)
      // Return empty results instead of throwing an error
      return { results: [] }
    }
  }

  async addConversationMemory(userId: string, messages: Array<{ role: string; content: string }>): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/memories/conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          user_id: userId,
          messages: messages,
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Error adding conversation memory:", error)
      return false
    }
  }

  async deleteMemories(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/memories`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Error deleting memories:", error)
      return false
    }
  }
}

export const mem0Service = new Mem0Service()
