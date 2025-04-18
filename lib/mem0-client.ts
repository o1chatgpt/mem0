import { config } from "./config"

interface MemoryResponse {
  results: Array<{
    id: string
    memory: string
    metadata?: Record<string, any>
    timestamp: number
  }>
}

export class Mem0Client {
  private apiKey: string
  private apiUrl: string
  private isAvailable = false
  private structuredEndpointAvailable = false
  private memoryEndpointAvailable = false // New flag to track memory endpoint availability

  constructor() {
    // Defer accessing config until the constructor is called
    this.apiKey = ""
    this.apiUrl = ""
    this.isAvailable = false
  }

  // Initialize method to set up the client at runtime
  initialize() {
    if (this.apiKey) return // Already initialized

    this.apiKey = config.mem0ApiKey || ""
    this.apiUrl = config.mem0ApiUrl || "https://api.mem0.ai"

    // In preview environment, assume API is not available to avoid errors
    this.isAvailable = process.env.NODE_ENV === "production" && !!this.apiKey

    console.log(`Mem0Client initialized with API ${this.isAvailable ? "enabled" : "disabled"}`)
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    this.initialize()

    if (!this.isAvailable) {
      throw new Error("Mem0 API is not available - API key is missing or in preview environment")
    }

    // Skip structured endpoint if we know it's not available
    if (endpoint.includes("/memory/structured") && !this.structuredEndpointAvailable) {
      throw new Error("Structured memory endpoint is not available")
    }

    // Skip memory endpoint if we know it's not available
    if (endpoint === "/memory" && !this.memoryEndpointAvailable) {
      throw new Error("Memory endpoint is not available")
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

        // If we get a 404 on the memory endpoint, mark it as unavailable
        if (response.status === 404 && endpoint === "/memory") {
          this.memoryEndpointAvailable = false
          console.warn("Mem0 memory endpoint is not available, will use local fallback")
          throw new Error(`Mem0 API memory endpoint not available: ${response.status} ${response.statusText}`)
        }

        throw new Error(`Mem0 API error: ${response.status} ${response.statusText}`)
      }

      // If we successfully access an endpoint, mark it as available
      if (endpoint.includes("/memory/structured")) {
        this.structuredEndpointAvailable = true
      }
      if (endpoint === "/memory") {
        this.memoryEndpointAvailable = true
      }

      return response.json()
    } catch (error) {
      console.error(`Mem0 API fetch error for ${endpoint}:`, error)
      throw error
    }
  }

  async add(messages: Array<{ role: string; content: string }>, userId: string): Promise<void> {
    if (!this.isAvailable || !this.memoryEndpointAvailable) {
      console.log("Skipping Mem0 API add - API or memory endpoint not available")
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
      // Mark memory endpoint as unavailable if we get an error
      this.memoryEndpointAvailable = false
      throw error
    }
  }

  async search(query: string, userId: string, limit = 5): Promise<MemoryResponse> {
    if (!this.isAvailable || !this.memoryEndpointAvailable) {
      console.log("Skipping Mem0 API search - API or memory endpoint not available")
      return { results: [] }
    }

    try {
      return await this.fetchWithAuth(
        `/memory/search?query=${encodeURIComponent(query)}&user_id=${encodeURIComponent(userId)}&limit=${limit}`,
      )
    } catch (error) {
      console.error("Error searching memories:", error)
      // Mark memory endpoint as unavailable if we get an error
      this.memoryEndpointAvailable = false
      return { results: [] }
    }
  }

  async storeMemory<T>(userId: string, key: string, data: T): Promise<void> {
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

  async retrieveMemory<T>(userId: string, key: string): Promise<T | null> {
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
    if (!this.isAvailable || !this.memoryEndpointAvailable) {
      console.log("Skipping Mem0 API clear - API or memory endpoint not available")
      return
    }

    try {
      await this.fetchWithAuth(`/memory?user_id=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Error clearing memory:", error)
      // Mark memory endpoint as unavailable if we get an error
      this.memoryEndpointAvailable = false
      throw error
    }
  }

  isApiAvailable(): boolean {
    return this.isAvailable && this.memoryEndpointAvailable
  }

  isStructuredEndpointAvailable(): boolean {
    return this.isAvailable && this.structuredEndpointAvailable
  }
}

// Create a lazy-loaded singleton instance
let mem0ClientInstance: Mem0Client | null = null
export const mem0Client = new Proxy({} as Mem0Client, {
  get: (target, prop) => {
    if (!mem0ClientInstance) {
      mem0ClientInstance = new Mem0Client()
      mem0ClientInstance.initialize()
    }
    return mem0ClientInstance[prop as keyof Mem0Client]
  },
})
