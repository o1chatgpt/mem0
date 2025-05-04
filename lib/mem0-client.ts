import { config } from "./config"

interface MemoryOptions {
  query: string
  user_id: string
  limit?: number
}

interface MemoryResult {
  id: string
  memory: string
  metadata?: Record<string, any>
  timestamp: number
}

interface MemoryResponse {
  results: MemoryResult[]
}

export class Mem0Client {
  private apiKey: string
  private apiUrl: string
  private isAvailable = false
  private structuredEndpointAvailable = false // Add this flag

  constructor() {
    this.apiKey = config.mem0ApiKey || ""
    this.apiUrl = config.mem0ApiUrl || "https://api.mem0.ai"
    this.isAvailable = !!this.apiKey

    // Initially assume structured endpoint is available if API is available
    this.structuredEndpointAvailable = this.isAvailable
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.isAvailable) {
      throw new Error("Mem0 API is not available - API key is missing")
    }

    // Skip structured endpoint if we know it's not available
    if (endpoint.includes("/memory/structured") && !this.structuredEndpointAvailable) {
      throw new Error("Structured memory endpoint is not available")
    }

    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    }

    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        ...options,
        headers,
      })

      if (!response.ok) {
        // If we get a 404 on the structured endpoint, mark it as unavailable
        if (response.status === 404 && endpoint.includes("/memory/structured")) {
          this.structuredEndpointAvailable = false
          console.warn("Mem0 structured memory endpoint is not available, will use local fallback")
          throw new Error(`Mem0 API structured endpoint not available: ${response.status} ${response.statusText}`)
        }

        throw new Error(`Mem0 API error: ${response.status} ${response.statusText}`)
      }

      // If we successfully access the structured endpoint, mark it as available
      if (endpoint.includes("/memory/structured")) {
        this.structuredEndpointAvailable = true
      }

      return response.json()
    } catch (error) {
      console.error(`Mem0 API fetch error for ${endpoint}:`, error)
      throw error
    }
  }

  async add(messages: Array<{ role: string; content: string }>, userId: string): Promise<void> {
    if (!this.isAvailable) {
      console.log("Skipping Mem0 API add - API not available")
      return
    }

    try {
      await this.fetchWithAuth("/memory", {
        method: "POST",
        body: JSON.stringify({
          messages,
          user_id: userId,
        }),
      })
    } catch (error) {
      console.error("Error adding memory:", error)
      throw error
    }
  }

  async search(options: MemoryOptions): Promise<MemoryResponse> {
    if (!this.isAvailable) {
      console.log("Skipping Mem0 API search - API not available")
      return { results: [] }
    }

    try {
      const { query, user_id, limit = 5 } = options
      return await this.fetchWithAuth(
        `/memory/search?query=${encodeURIComponent(query)}&user_id=${encodeURIComponent(user_id)}&limit=${limit}`,
      )
    } catch (error) {
      console.error("Error searching memories:", error)
      return { results: [] }
    }
  }

  async storeMemory<T>(key: string, data: T, userId: string): Promise<void> {
    if (!this.isAvailable || !this.structuredEndpointAvailable) {
      console.log("Skipping Mem0 API structured store - API or structured endpoint not available")
      return
    }

    try {
      await this.fetchWithAuth("/memory/structured", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          key,
          data,
        }),
      })
    } catch (error) {
      console.error("Error storing structured memory:", error)
      this.structuredEndpointAvailable = false
      throw error
    }
  }

  async retrieveMemory<T>(key: string, userId: string): Promise<T | null> {
    if (!this.isAvailable || !this.structuredEndpointAvailable) {
      console.log("Skipping Mem0 API structured retrieve - API or structured endpoint not available")
      return null
    }

    try {
      const response = await this.fetchWithAuth(
        `/memory/structured?user_id=${encodeURIComponent(userId)}&key=${encodeURIComponent(key)}`,
      )
      return response.data as T
    } catch (error) {
      console.error("Error retrieving structured memory:", error)
      // If we get here due to a 404, structuredEndpointAvailable will be set to false
      return null
    }
  }

  async clearMemory(userId: string): Promise<void> {
    if (!this.isAvailable) {
      console.log("Skipping Mem0 API clear - API not available")
      return
    }

    try {
      await this.fetchWithAuth(`/memory?user_id=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Error clearing memory:", error)
      throw error
    }
  }

  isApiAvailable(): boolean {
    return this.isAvailable
  }

  // Add this missing function
  isStructuredEndpointAvailable(): boolean {
    return this.isAvailable && this.structuredEndpointAvailable
  }
}

// Create a singleton instance
export const mem0Client = new Mem0Client()
