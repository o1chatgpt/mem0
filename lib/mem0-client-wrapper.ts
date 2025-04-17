"use client"

// Client-side wrapper for Mem0 API
export class Mem0ClientWrapper {
  async createMemory(content: string, metadata: any = {}) {
    try {
      const response = await fetch("/api/mem0/memories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

  async searchMemories(query: string, limit = 10) {
    try {
      const response = await fetch(`/api/mem0/search?q=${encodeURIComponent(query)}&limit=${limit}`)

      if (!response.ok) {
        throw new Error(`Failed to search memories: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error searching memories:", error)
      return { results: [] }
    }
  }
}

// Create and export singleton instance
export const mem0ClientWrapper = new Mem0ClientWrapper()
