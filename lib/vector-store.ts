import { dbService } from "./db-service"
import { config } from "./config"

// Define types for vector embeddings
export interface VectorEmbedding {
  id: string
  vector: number[]
  metadata: Record<string, any>
  text: string
  userId: string
  createdAt: string
}

// In-memory fallback storage when database is unavailable
const fallbackVectorStorage: Record<string, VectorEmbedding[]> = {}

export class VectorStore {
  private initialized = false
  private useLocalFallback = true
  private userId: string
  private openaiApiKey: string

  constructor(userId = "default-user") {
    this.userId = userId
    this.openaiApiKey = config.openaiApiKey || ""
    console.log("VectorStore initialized with local fallback by default")
  }

  async initialize(): Promise<boolean> {
    if (this.initialized) return !this.useLocalFallback

    // Check if we have OpenAI API key for embeddings
    if (!this.openaiApiKey) {
      console.warn("OpenAI API key not found, vector embeddings will be simulated")
    }

    // Initialize database connection
    try {
      const dbInitialized = await dbService.initialize()
      this.useLocalFallback = !dbInitialized
    } catch (error) {
      console.error("Error initializing vector store:", error)
      this.useLocalFallback = true
    }

    this.initialized = true
    return !this.useLocalFallback
  }

  // Generate embeddings using OpenAI API or simulate if not available
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.openaiApiKey) {
      return this.simulateEmbedding(text)
    }

    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          input: text,
          model: "text-embedding-ada-002",
        }),
      })

      if (!response.ok) {
        console.warn("Error generating embeddings from OpenAI, falling back to simulation")
        return this.simulateEmbedding(text)
      }

      const data = await response.json()
      return data.data[0].embedding
    } catch (error) {
      console.error("Error generating embeddings:", error)
      return this.simulateEmbedding(text)
    }
  }

  // Simulate embeddings for testing when OpenAI API is not available
  private simulateEmbedding(text: string): number[] {
    // Create a deterministic but simple embedding based on the text
    // This is NOT suitable for production, just for demonstration
    const hash = (s: string): number => {
      let h = 0
      for (let i = 0; i < s.length; i++) {
        h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
      }
      return h
    }

    // Generate a 128-dimensional vector based on the text
    const vector: number[] = []
    for (let i = 0; i < 128; i++) {
      // Use different seed for each dimension
      const seed = hash(text + i.toString())
      // Generate a value between -1 and 1
      vector.push((seed % 1000) / 500 - 1)
    }

    // Normalize the vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    return vector.map((val) => val / magnitude)
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error("Vectors must have the same dimensions")
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i]
      normA += vecA[i] * vecA[i]
      normB += vecB[i] * vecB[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  // Store a vector embedding
  async storeEmbedding(text: string, metadata: Record<string, any> = {}): Promise<string> {
    await this.initialize()

    const vector = await this.generateEmbedding(text)
    const id = `vec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const embedding: VectorEmbedding = {
      id,
      vector,
      metadata,
      text,
      userId: this.userId,
      createdAt: new Date().toISOString(),
    }

    if (this.useLocalFallback) {
      if (!fallbackVectorStorage[this.userId]) {
        fallbackVectorStorage[this.userId] = []
      }
      fallbackVectorStorage[this.userId].push(embedding)
    } else {
      try {
        // Store in database
        await dbService.storeVectorEmbedding(embedding)
      } catch (error) {
        console.error("Error storing vector embedding in database, falling back to local storage:", error)
        if (!fallbackVectorStorage[this.userId]) {
          fallbackVectorStorage[this.userId] = []
        }
        fallbackVectorStorage[this.userId].push(embedding)
      }
    }

    return id
  }

  // Search for similar vectors
  async searchSimilar(text: string, limit = 5, threshold = 0.7): Promise<VectorEmbedding[]> {
    await this.initialize()

    const queryVector = await this.generateEmbedding(text)

    if (this.useLocalFallback) {
      const userVectors = fallbackVectorStorage[this.userId] || []

      // Calculate similarity for each vector
      const withSimilarity = userVectors.map((embedding) => ({
        embedding,
        similarity: this.cosineSimilarity(queryVector, embedding.vector),
      }))

      // Filter by threshold and sort by similarity
      return withSimilarity
        .filter((item) => item.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map((item) => item.embedding)
    } else {
      try {
        // Search in database
        return await dbService.searchVectorEmbeddings(this.userId, queryVector, limit, threshold)
      } catch (error) {
        console.error("Error searching vector embeddings in database, falling back to local search:", error)

        // Fall back to local search
        const userVectors = fallbackVectorStorage[this.userId] || []

        // Calculate similarity for each vector
        const withSimilarity = userVectors.map((embedding) => ({
          embedding,
          similarity: this.cosineSimilarity(queryVector, embedding.vector),
        }))

        // Filter by threshold and sort by similarity
        return withSimilarity
          .filter((item) => item.similarity >= threshold)
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, limit)
          .map((item) => item.embedding)
      }
    }
  }

  // Get a vector embedding by ID
  async getEmbedding(id: string): Promise<VectorEmbedding | null> {
    await this.initialize()

    if (this.useLocalFallback) {
      return (fallbackVectorStorage[this.userId] || []).find((embedding) => embedding.id === id) || null
    } else {
      try {
        return await dbService.getVectorEmbedding(id)
      } catch (error) {
        console.error("Error getting vector embedding from database, falling back to local storage:", error)
        return (fallbackVectorStorage[this.userId] || []).find((embedding) => embedding.id === id) || null
      }
    }
  }

  // Delete a vector embedding
  async deleteEmbedding(id: string): Promise<boolean> {
    await this.initialize()

    if (this.useLocalFallback) {
      const userVectors = fallbackVectorStorage[this.userId] || []
      const initialLength = userVectors.length
      fallbackVectorStorage[this.userId] = userVectors.filter((embedding) => embedding.id !== id)
      return userVectors.length < initialLength
    } else {
      try {
        return await dbService.deleteVectorEmbedding(id)
      } catch (error) {
        console.error("Error deleting vector embedding from database, falling back to local storage:", error)
        const userVectors = fallbackVectorStorage[this.userId] || []
        const initialLength = userVectors.length
        fallbackVectorStorage[this.userId] = userVectors.filter((embedding) => embedding.id !== id)
        return userVectors.length < initialLength
      }
    }
  }

  // Clear all vector embeddings for a user
  async clearEmbeddings(): Promise<boolean> {
    await this.initialize()

    if (this.useLocalFallback) {
      fallbackVectorStorage[this.userId] = []
      return true
    } else {
      try {
        return await dbService.clearVectorEmbeddings(this.userId)
      } catch (error) {
        console.error("Error clearing vector embeddings from database, falling back to local storage:", error)
        fallbackVectorStorage[this.userId] = []
        return true
      }
    }
  }

  isUsingLocalFallback(): boolean {
    return this.useLocalFallback
  }
}

// Create a singleton instance
export const vectorStore = new VectorStore()
