import { config } from "./config"

interface MemoryResponse {
  results: Array<{
    id: string
    memory: string
    metadata?: Record<string, any>
    timestamp: number
  }>
}

// Safe check for preview environment that works on both client and server
const isPreviewEnvironment = () => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    // Server-side - assume it's a preview if not in production
    return process.env.NODE_ENV !== "production"
  }

  // Client-side - check hostname and path
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname.includes("vercel.app") ||
    window.location.pathname.includes("/direct-entry")
  )
}

// Safe check for browser environment
const isBrowser = typeof window !== "undefined"

export class Mem0Client {
  private apiKey: string
  private apiUrl: string
  private isAvailable = false
  private structuredEndpointAvailable = true
  private memoryEndpointAvailable = true

  constructor() {
    this.apiKey = config.mem0ApiKey || ""
    this.apiUrl = config.mem0ApiUrl || "https://api.mem0.ai"

    // Safely check if we're in a preview environment
    const inPreview = isPreviewEnvironment()

    if (inPreview) {
      console.log("Preview environment detected, disabling Mem0 API client")
      this.isAvailable = false
      this.structuredEndpointAvailable = false
      this.memoryEndpointAvailable = false
    } else {
      this.isAvailable = !!this.apiKey && isBrowser
    }
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    // Safely check if we're in a preview environment
    if (isPreviewEnvironment() || !isBrowser) {
      console.log(`Skipping Mem0 API call to ${endpoint} in preview environment or server-side`)
      throw new Error("Mem0 API is not available in preview environment or server-side")
    }

    if (!this.isAvailable) {
      throw new Error("Mem0 API is not available - API key is missing")
    }

    // Skip structured endpoint if we know it's not available
    if (endpoint.includes("/memory/structured") && !this.structuredEndpointAvailable) {
      throw new Error("Structured memory endpoint is not available")
    }

    // Skip regular memory endpoint if we know it's not available
    if ((endpoint === "/memory" || endpoint.startsWith("/memory?")) && !this.memoryEndpointAvailable) {
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

        // If we get a 404 on the regular memory endpoint, mark it as unavailable
        if (response.status === 404 && (endpoint === "/memory" || endpoint.startsWith("/memory?"))) {
          this.memoryEndpointAvailable = false
          console.warn("Mem0 memory endpoint is not available, will use local fallback")
          throw new Error(`Mem0 API memory endpoint not available: ${response.status} ${response.statusText}`)
        }

        throw new Error(`Mem0 API error: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error(`Mem0 API fetch error for ${endpoint}:`, error)
      throw error
    }
  }

  async add(messages: Array<{ role: string; content: string }>, userId: string): Promise<void> {
    // Skip in preview environment or server-side
    if (isPreviewEnvironment() || !isBrowser) {
      console.log("Skipping Mem0 API add in preview environment or server-side")
      return
    }

    if (!this.isAvailable || !this.memoryEndpointAvailable) return

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
      // If we get here due to a 404, memoryEndpointAvailable will be set to false
      this.memoryEndpointAvailable = false
      throw error
    }
  }

  async search(query: string, userId: string, limit = 5): Promise<MemoryResponse> {
    // Skip in preview environment or server-side
    if (isPreviewEnvironment() || !isBrowser) {
      console.log("Skipping Mem0 API search in preview environment or server-side")
      return { results: [] }
    }

    if (!this.isAvailable || !this.memoryEndpointAvailable) {
      return { results: [] }
    }

    try {
      return await this.fetchWithAuth(
        `/memory/search?query=${encodeURIComponent(query)}&user_id=${encodeURIComponent(userId)}&limit=${limit}`,
      )
    } catch (error) {
      console.error("Error searching memories:", error)
      this.memoryEndpointAvailable = false
      return { results: [] }
    }
  }

  async storeMemory<T>(userId: string, key: string, data: T): Promise<void> {
    // Skip in preview environment or server-side
    if (isPreviewEnvironment() || !isBrowser) {
      console.log("Skipping Mem0 API storeMemory in preview environment or server-side")
      return
    }

    if (!this.isAvailable || !this.structuredEndpointAvailable) return

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
    // Skip in preview environment or server-side
    if (isPreviewEnvironment() || !isBrowser) {
      console.log("Skipping Mem0 API retrieveMemory in preview environment or server-side")
      return null
    }

    if (!this.isAvailable || !this.structuredEndpointAvailable) {
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
      this.structuredEndpointAvailable = false
      return null
    }
  }

  async clearMemory(userId: string): Promise<void> {
    // Skip in preview environment or server-side
    if (isPreviewEnvironment() || !isBrowser) {
      console.log("Skipping Mem0 API clearMemory in preview environment or server-side")
      return
    }

    if (!this.isAvailable || !this.memoryEndpointAvailable) return

    try {
      await this.fetchWithAuth(`/memory?user_id=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Error clearing memory:", error)
      // If we get here due to a 404, memoryEndpointAvailable will be set to false
      this.memoryEndpointAvailable = false
      throw error
    }
  }

  isApiAvailable(): boolean {
    return this.isAvailable && isBrowser && !isPreviewEnvironment()
  }

  isStructuredEndpointAvailable(): boolean {
    return this.structuredEndpointAvailable && isBrowser && !isPreviewEnvironment()
  }

  isMemoryEndpointAvailable(): boolean {
    return this.memoryEndpointAvailable && isBrowser && !isPreviewEnvironment()
  }
}

// Create a singleton instance
export const mem0Client = new Mem0Client()
