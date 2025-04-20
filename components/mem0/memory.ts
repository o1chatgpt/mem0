"use client"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { groq } from "@ai-sdk/groq"
import type { FamilyMember, MemoryItem } from "@/types/family-member"

type Message = {
  role: string
  content: string
}

type MemoryResult = {
  memory: string
  relevance: number
  timestamp: string
}

type SearchResult = {
  results: MemoryResult[]
}

type ApiProvider = "openai" | "groq" | "unknown"

export class Memory {
  private apiKey: string
  private memories: Map<string, Array<Message & { timestamp: string }>>
  private vectorStores: Map<string, MemoryItem[]>
  private workingModel: string | null
  private apiProvider: ApiProvider
  private familyMembers: FamilyMember[]

  constructor(apiKey = "") {
    this.apiKey = apiKey
    this.memories = new Map()
    this.vectorStores = new Map()
    this.workingModel = null
    this.apiProvider = "unknown" // Initialize as unknown, will be properly detected during connection test
    this.familyMembers = []
    this.loadMemoriesFromStorage()
    this.loadFamilyMembersFromStorage()
    this.loadVectorStoresFromStorage()
  }

  private detectApiProvider(apiKey: string): ApiProvider {
    if (!apiKey) return "unknown"

    // Check for Groq API key formats first
    if (apiKey.startsWith("gsk_") || apiKey.startsWith("sk-proj-")) {
      return "groq"
    }

    // Then check for OpenAI API key formats
    if (apiKey.startsWith("sk-")) {
      return "openai"
    }

    return "unknown"
  }

  async testConnection(): Promise<boolean> {
    // Detect the API provider based on the key format
    this.apiProvider = this.detectApiProvider(this.apiKey)
    console.log(`Detected API provider: ${this.apiProvider}`)

    if (this.apiProvider === "unknown") {
      throw new Error("Unknown API key format. Please check your API key.")
    }

    // Define models to try based on the provider
    let modelsToTry: string[] = []

    if (this.apiProvider === "openai") {
      modelsToTry = ["gpt-4o-mini", "gpt-4o", "gpt-4", "gpt-3.5-turbo-0125"]
    } else if (this.apiProvider === "groq") {
      modelsToTry = ["llama3-8b-8192", "llama3-70b-8192", "mixtral-8x7b-32768"]
    }

    let lastError = null

    for (const modelName of modelsToTry) {
      try {
        console.log(`Testing connection with ${this.apiProvider} model: ${modelName}`)

        if (this.apiProvider === "openai") {
          const { text } = await generateText({
            model: openai(modelName),
            prompt: "Hello, this is a test message to verify the API connection.",
            apiKey: this.apiKey,
          })
          console.log(`Connection successful with ${this.apiProvider} model: ${modelName}`)
          this.workingModel = modelName
          return true
        } else if (this.apiProvider === "groq") {
          const { text } = await generateText({
            model: groq(modelName),
            prompt: "Hello, this is a test message to verify the API connection.",
            apiKey: this.apiKey,
          })
          console.log(`Connection successful with ${this.apiProvider} model: ${modelName}`)
          this.workingModel = modelName
          return true
        }
      } catch (error) {
        console.warn(`Failed to connect using ${this.apiProvider} model ${modelName}:`, error)
        lastError = error
        // Continue to the next model
      }
    }

    // If we get here, all models failed
    console.error(`All ${this.apiProvider} model connection attempts failed:`, lastError)

    // Provide a more helpful error message based on the provider
    let errorMessage = `All ${this.apiProvider} model connection attempts failed. `

    if (this.apiProvider === "openai") {
      errorMessage += "Please check your OpenAI API key and permissions. Make sure you have access to the models."
    } else if (this.apiProvider === "groq") {
      errorMessage += "Please check your Groq API key and permissions. Make sure you have access to the models."
    }

    if (lastError?.message) {
      errorMessage += ` Error: ${lastError.message}`
    }

    throw new Error(errorMessage)
  }

  private loadMemoriesFromStorage(): void {
    try {
      // Get all keys from localStorage that start with mem0_
      const keys = Object.keys(localStorage).filter((key) => key.startsWith("mem0_"))

      for (const key of keys) {
        const userId = key.replace("mem0_", "")
        const storedMemories = localStorage.getItem(key)

        if (storedMemories) {
          this.memories.set(userId, JSON.parse(storedMemories))
        }
      }
    } catch (e) {
      console.warn("Could not load memories from localStorage", e)
    }
  }

  private loadFamilyMembersFromStorage(): void {
    try {
      const storedFamilyMembers = localStorage.getItem("family_members")
      if (storedFamilyMembers) {
        this.familyMembers = JSON.parse(storedFamilyMembers)
      } else {
        // Initialize with a default family member if none exist
        const defaultMember: FamilyMember = {
          id: "default",
          name: "Family Assistant",
          role: "Assistant",
          description: "The default AI assistant for the family",
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
        }
        this.familyMembers = [defaultMember]
        this.saveFamilyMembersToStorage()
      }
    } catch (e) {
      console.warn("Could not load family members from localStorage", e)
    }
  }

  private loadVectorStoresFromStorage(): void {
    try {
      // Load vector stores for each family member
      for (const member of this.familyMembers) {
        const storedVectorStore = localStorage.getItem(`vector_store_${member.id}`)
        if (storedVectorStore) {
          this.vectorStores.set(member.id, JSON.parse(storedVectorStore))
        } else {
          // Initialize empty vector store for this family member
          this.vectorStores.set(member.id, [])
        }
      }
    } catch (e) {
      console.warn("Could not load vector stores from localStorage", e)
    }
  }

  private saveMemoriesToStorage(userId: string): void {
    try {
      const userMemories = this.memories.get(userId)
      if (userMemories) {
        localStorage.setItem(`mem0_${userId}`, JSON.stringify(userMemories))
      }
    } catch (e) {
      console.warn("Could not save memories to localStorage", e)
    }
  }

  private saveFamilyMembersToStorage(): void {
    try {
      localStorage.setItem("family_members", JSON.stringify(this.familyMembers))
    } catch (e) {
      console.warn("Could not save family members to localStorage", e)
    }
  }

  private saveVectorStoreToStorage(familyMemberId: string): void {
    try {
      const vectorStore = this.vectorStores.get(familyMemberId)
      if (vectorStore) {
        localStorage.setItem(`vector_store_${familyMemberId}`, JSON.stringify(vectorStore))
      }
    } catch (e) {
      console.warn("Could not save vector store to localStorage", e)
    }
  }

  async add(messages: Message[], userId = "default_user", familyMemberId = "default"): Promise<void> {
    if (!this.memories.has(userId)) {
      this.memories.set(userId, [])
    }

    const userMemories = this.memories.get(userId) || []
    const timestamp = new Date().toISOString()

    const messagesWithTimestamp = messages.map((msg) => ({
      ...msg,
      timestamp,
    }))

    this.memories.set(userId, [...userMemories, ...messagesWithTimestamp])
    this.saveMemoriesToStorage(userId)

    // Also add to the vector store for the specified family member
    await this.addToVectorStore(messages, familyMemberId)

    // Update last accessed timestamp for the family member
    this.updateFamilyMemberLastAccessed(familyMemberId)
  }

  private async addToVectorStore(messages: Message[], familyMemberId: string): Promise<void> {
    if (!this.vectorStores.has(familyMemberId)) {
      this.vectorStores.set(familyMemberId, [])
    }

    const vectorStore = this.vectorStores.get(familyMemberId) || []
    const timestamp = new Date().toISOString()

    // In a real implementation, we would create embeddings using OpenAI's embedding API
    // For now, we'll just store the messages directly
    for (const message of messages) {
      const memoryItem: MemoryItem = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        content: message.content,
        metadata: {
          timestamp,
          source: message.role,
          type: "message",
        },
      }

      // Create embedding for this memory item
      try {
        const embedding = await this.createEmbedding(message.content)
        memoryItem.embedding = embedding
      } catch (error) {
        console.error("Failed to create embedding:", error)
        // Continue without embedding if it fails
      }

      vectorStore.push(memoryItem)
    }

    this.vectorStores.set(familyMemberId, vectorStore)
    this.saveVectorStoreToStorage(familyMemberId)
  }

  private async createEmbedding(text: string): Promise<number[] | undefined> {
    try {
      // In a real implementation, we would use OpenAI's embedding API
      // For now, we'll just return a random embedding
      // This is a placeholder for the actual embedding creation
      return Array.from({ length: 10 }, () => Math.random())
    } catch (error) {
      console.error("Error creating embedding:", error)
      return undefined
    }
  }

  private updateFamilyMemberLastAccessed(familyMemberId: string): void {
    const memberIndex = this.familyMembers.findIndex((member) => member.id === familyMemberId)
    if (memberIndex !== -1) {
      this.familyMembers[memberIndex].lastAccessed = new Date().toISOString()
      this.saveFamilyMembersToStorage()
    }
  }

  async search(query: string, userId = "default_user", limit = 5, familyMemberId = "default"): Promise<SearchResult> {
    // Update last accessed timestamp for the family member
    this.updateFamilyMemberLastAccessed(familyMemberId)

    // First, try to search in the vector store for the specified family member
    const vectorResults = await this.searchVectorStore(query, familyMemberId, limit)
    if (vectorResults.results.length > 0) {
      return vectorResults
    }

    // Fall back to the traditional search if vector search returns no results
    const userMemories = this.memories.get(userId) || []

    if (userMemories.length === 0) {
      return { results: [] }
    }

    // In a real implementation, you would use semantic search with embeddings
    // For now, we'll use a simple keyword-based search
    const results: MemoryResult[] = []

    for (const message of userMemories) {
      const relevance = this.calculateRelevance(query, message.content)
      if (relevance > 0.2) {
        // Lower threshold for better results
        results.push({
          memory: message.content,
          relevance,
          timestamp: message.timestamp,
        })
      }
    }

    // Sort by relevance and limit results
    return {
      results: results.sort((a, b) => b.relevance - a.relevance).slice(0, limit),
    }
  }

  private async searchVectorStore(query: string, familyMemberId: string, limit = 5): Promise<SearchResult> {
    if (!this.vectorStores.has(familyMemberId)) {
      return { results: [] }
    }

    const vectorStore = this.vectorStores.get(familyMemberId) || []
    if (vectorStore.length === 0) {
      return { results: [] }
    }

    try {
      // Create an embedding for the query
      const queryEmbedding = await this.createEmbedding(query)
      if (!queryEmbedding) {
        return { results: [] }
      }

      // Calculate similarity between query embedding and each memory item embedding
      const results: MemoryResult[] = []
      for (const item of vectorStore) {
        if (item.embedding) {
          const relevance = this.calculateCosineSimilarity(queryEmbedding, item.embedding)
          if (relevance > 0.2) {
            results.push({
              memory: item.content,
              relevance,
              timestamp: item.metadata.timestamp,
            })
          }
        }
      }

      return {
        results: results.sort((a, b) => b.relevance - a.relevance).slice(0, limit),
      }
    } catch (error) {
      console.error("Error searching vector store:", error)
      return { results: [] }
    }
  }

  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      return 0
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    normA = Math.sqrt(normA)
    normB = Math.sqrt(normB)

    if (normA === 0 || normB === 0) {
      return 0
    }

    return dotProduct / (normA * normB)
  }

  private calculateRelevance(query: string, content: string): number {
    // Improved relevance calculation
    const queryWords = new Set(
      query
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 2),
    )
    const contentWords = content
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2)

    let matches = 0
    let partialMatches = 0

    for (const contentWord of contentWords) {
      if (queryWords.has(contentWord)) {
        matches += 1
      } else {
        // Check for partial matches (substrings)
        for (const queryWord of queryWords) {
          if (contentWord.includes(queryWord) || queryWord.includes(contentWord)) {
            partialMatches += 0.5
            break
          }
        }
      }
    }

    // Calculate relevance score
    const exactMatchScore = matches / Math.max(queryWords.size, 1)
    const partialMatchScore = (partialMatches / Math.max(queryWords.size, 1)) * 0.5

    return Math.min(exactMatchScore + partialMatchScore, 1)
  }

  async generateWithMemory(prompt: string, userId = "default_user", familyMemberId = "default"): Promise<string> {
    // Update last accessed timestamp for the family member
    this.updateFamilyMemberLastAccessed(familyMemberId)

    // Get the family member details
    const familyMember = this.familyMembers.find((member) => member.id === familyMemberId)
    const memberName = familyMember?.name || "AI Assistant"
    const memberRole = familyMember?.role || "Assistant"

    // Search for relevant memories in the vector store
    const relevantMemories = await this.search(prompt, userId, 5, familyMemberId)

    // Format memories with timestamps
    const memoriesStr = relevantMemories.results
      .map((entry) => {
        const date = new Date(entry.timestamp).toLocaleString()
        return `- ${entry.memory} (${date})`
      })
      .join("\n")

    const systemPrompt = `You are ${memberName}, a helpful ${memberRole} for the AI Family Toolkit. 
You have access to the user's memories and file interactions.

User Memories:
${memoriesStr || "No relevant memories found."}

Use these memories when relevant to provide personalized responses.
Always be helpful, concise, and focus on file management tasks.
If the user asks about files or folders they've interacted with before, reference those specific items.
Remember to stay in character as ${memberName} with the role of ${memberRole}.`

    try {
      // Use the working model that was successful in the connection test
      // or fall back to a default model based on the provider
      let modelToUse = this.workingModel

      if (!modelToUse) {
        if (this.apiProvider === "openai") {
          modelToUse = "gpt-4o-mini"
        } else if (this.apiProvider === "groq") {
          modelToUse = "llama3-8b-8192"
        } else {
          throw new Error("No working model found and provider is unknown")
        }
      }

      console.log(`Using ${this.apiProvider} model for generation: ${modelToUse}`)

      let result
      if (this.apiProvider === "openai") {
        result = await generateText({
          model: openai(modelToUse),
          system: systemPrompt,
          prompt,
          apiKey: this.apiKey,
        })
      } else if (this.apiProvider === "groq") {
        result = await generateText({
          model: groq(modelToUse),
          system: systemPrompt,
          prompt,
          apiKey: this.apiKey,
        })
      } else {
        throw new Error(`Unsupported API provider: ${this.apiProvider}`)
      }

      // Store this interaction as a memory
      await this.add(
        [
          { role: "user", content: prompt },
          { role: "assistant", content: result.text },
        ],
        userId,
        familyMemberId,
      )

      return result.text
    } catch (error) {
      console.error("Error generating response with memory:", error)
      throw error
    }
  }

  async clearMemories(userId = "default_user", familyMemberId?: string): Promise<void> {
    // Clear traditional memories
    this.memories.delete(userId)
    localStorage.removeItem(`mem0_${userId}`)

    // If a family member ID is provided, clear only that vector store
    if (familyMemberId) {
      this.vectorStores.delete(familyMemberId)
      localStorage.removeItem(`vector_store_${familyMemberId}`)
    } else {
      // Clear all vector stores
      for (const member of this.familyMembers) {
        this.vectorStores.delete(member.id)
        localStorage.removeItem(`vector_store_${member.id}`)
      }
    }
  }

  // Family member management methods
  getFamilyMembers(): FamilyMember[] {
    return [...this.familyMembers]
  }

  getFamilyMember(id: string): FamilyMember | undefined {
    return this.familyMembers.find((member) => member.id === id)
  }

  addFamilyMember(member: Omit<FamilyMember, "id" | "createdAt">): FamilyMember {
    const newMember: FamilyMember = {
      ...member,
      id: `member_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
    }

    this.familyMembers.push(newMember)
    this.saveFamilyMembersToStorage()

    // Initialize empty vector store for this family member
    this.vectorStores.set(newMember.id, [])
    this.saveVectorStoreToStorage(newMember.id)

    return newMember
  }

  updateFamilyMember(id: string, updates: Partial<Omit<FamilyMember, "id" | "createdAt">>): FamilyMember | null {
    const index = this.familyMembers.findIndex((member) => member.id === id)
    if (index === -1) return null

    this.familyMembers[index] = {
      ...this.familyMembers[index],
      ...updates,
    }

    this.saveFamilyMembersToStorage()
    return this.familyMembers[index]
  }

  deleteFamilyMember(id: string): boolean {
    // Don't allow deleting the default member
    if (id === "default") return false

    const initialLength = this.familyMembers.length
    this.familyMembers = this.familyMembers.filter((member) => member.id !== id)

    if (this.familyMembers.length !== initialLength) {
      this.saveFamilyMembersToStorage()

      // Delete the vector store for this family member
      this.vectorStores.delete(id)
      localStorage.removeItem(`vector_store_${id}`)

      return true
    }

    return false
  }
}
