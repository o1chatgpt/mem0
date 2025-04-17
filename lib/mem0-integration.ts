import { Memory } from "mem0ai"
import { config } from "./config"

export class Mem0Integration {
  private memory: Memory
  private initialized = false
  private apiEnabled = false

  constructor() {
    this.memory = new Memory()
    this.apiEnabled = !!config.mem0ApiKey
  }

  async initialize(): Promise<boolean> {
    if (this.initialized) return this.apiEnabled

    if (!config.mem0ApiKey) {
      console.log("Mem0 API key not found, integration disabled")
      this.apiEnabled = false
      this.initialized = true
      return false
    }

    try {
      // Test the connection
      await this.memory.search({ query: "test", user_id: "test", limit: 1 })

      this.apiEnabled = true
      this.initialized = true
      console.log("Mem0 integration initialized successfully")
      return true
    } catch (error) {
      console.error("Failed to initialize Mem0 integration:", error)
      this.apiEnabled = false
      this.initialized = true
      return false
    }
  }

  async addMemory(memory: string, userId: string, metadata: Record<string, any> = {}): Promise<void> {
    if (!this.apiEnabled) return

    try {
      await this.memory.add([{ role: "system", content: memory }], userId)
    } catch (error) {
      console.error("Error adding memory to Mem0:", error)
    }
  }

  async searchMemories(query: string, userId: string, limit = 5): Promise<any> {
    if (!this.apiEnabled) return { results: [] }

    try {
      return await this.memory.search({ query, user_id: userId, limit })
    } catch (error) {
      console.error("Error searching memories in Mem0:", error)
      return { results: [] }
    }
  }

  async storeStructuredMemory<T>(key: string, data: T, userId: string): Promise<void> {
    if (!this.apiEnabled) return

    try {
      await this.memory.storeMemory(key, data, userId)
    } catch (error) {
      console.error("Error storing structured memory in Mem0:", error)
    }
  }

  async retrieveStructuredMemory<T>(key: string, userId: string): Promise<T | null> {
    if (!this.apiEnabled) return null

    try {
      return await this.memory.retrieveMemory(key, userId)
    } catch (error) {
      console.error("Error retrieving structured memory from Mem0:", error)
      return null
    }
  }

  async clearMemories(userId: string): Promise<void> {
    if (!this.apiEnabled) return

    try {
      await this.memory.clearMemory(userId)
    } catch (error) {
      console.error("Error clearing memories in Mem0:", error)
    }
  }

  isEnabled(): boolean {
    return this.apiEnabled
  }
}

export const mem0Integration = new Mem0Integration()
