import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { config } from "./config"

export type UserRole = "admin" | "editor" | "viewer" | "ai_assistant"

export interface User {
  id: string
  username: string
  email?: string
  avatar_url?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface AIFamilyMember {
  id: string
  name: string
  description?: string
  personality: string
  avatar_url?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface AIMemory {
  id: string
  ai_family_member_id: string
  content: string
  embedding?: number[]
  metadata?: Record<string, any>
  created_at: string
}

export interface File {
  id: string
  name: string
  path: string
  type: string
  size: number
  content?: string
  url?: string
  owner_id: string
  is_favorite: boolean
  access_count: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface FilePermission {
  id: string
  file_id: string
  user_id?: string
  ai_family_member_id?: string
  permission_level: "read" | "write" | "admin"
  created_at: string
}

export interface VectorEmbedding {
  id: string
  content: string
  embedding: number[]
  metadata?: Record<string, any>
  user_id?: string
  ai_family_member_id?: string
  created_at: string
}

export class SupabaseService {
  private supabase: SupabaseClient
  private initialized = false
  private currentUser: User | null = null

  constructor() {
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)
  }

  async initialize(): Promise<boolean> {
    if (this.initialized) return true

    try {
      // Check if user is already authenticated
      const { data: session, error: sessionError } = await this.supabase.auth.getSession()

      if (sessionError) {
        console.error("Error getting session:", sessionError)
        return false
      }

      if (session?.session) {
        // Get user profile
        const { data: userData, error: userError } = await this.supabase
          .from("users")
          .select("*")
          .eq("id", session.session.user.id)
          .single()

        if (userError) {
          console.error("Error getting user data:", userError)
          return false
        }

        this.currentUser = userData
      }

      this.initialized = true
      return true
    } catch (error) {
      console.error("Error initializing Supabase service:", error)
      return false
    }
  }

  // Authentication methods
  async signIn(email: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Error signing in:", error)
        return null
      }

      // Get user profile
      const { data: userData, error: userError } = await this.supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (userError) {
        console.error("Error getting user data:", userError)
        return null
      }

      this.currentUser = userData
      return userData
    } catch (error) {
      console.error("Error signing in:", error)
      return null
    }
  }

  async signOut(): Promise<boolean> {
    try {
      const { error } = await this.supabase.auth.signOut()

      if (error) {
        console.error("Error signing out:", error)
        return false
      }

      this.currentUser = null
      return true
    } catch (error) {
      console.error("Error signing out:", error)
      return false
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.initialized) await this.initialize()
    return this.currentUser
  }

  // AI Family Members methods
  async getAIFamilyMembers(): Promise<AIFamilyMember[]> {
    try {
      const { data, error } = await this.supabase
        .from("ai_family_members")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error getting AI family members:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error getting AI family members:", error)
      return []
    }
  }

  async getAIFamilyMemberById(id: string): Promise<AIFamilyMember | null> {
    try {
      const { data, error } = await this.supabase.from("ai_family_members").select("*").eq("id", id).single()

      if (error) {
        console.error("Error getting AI family member:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error getting AI family member:", error)
      return null
    }
  }

  async createAIFamilyMember(
    member: Omit<AIFamilyMember, "id" | "created_by" | "created_at" | "updated_at">,
  ): Promise<AIFamilyMember | null> {
    if (!this.currentUser) {
      console.error("User not authenticated")
      return null
    }

    try {
      const { data, error } = await this.supabase
        .from("ai_family_members")
        .insert([
          {
            ...member,
            created_by: this.currentUser.id,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error creating AI family member:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error creating AI family member:", error)
      return null
    }
  }

  async updateAIFamilyMember(id: string, updates: Partial<AIFamilyMember>): Promise<AIFamilyMember | null> {
    try {
      const { data, error } = await this.supabase
        .from("ai_family_members")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating AI family member:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error updating AI family member:", error)
      return null
    }
  }

  async deleteAIFamilyMember(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("ai_family_members").delete().eq("id", id)

      if (error) {
        console.error("Error deleting AI family member:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error deleting AI family member:", error)
      return false
    }
  }

  // AI Memories methods
  async getAIMemories(aiMemberId: string): Promise<AIMemory[]> {
    try {
      const { data, error } = await this.supabase
        .from("ai_memories")
        .select("*")
        .eq("ai_family_member_id", aiMemberId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error getting AI memories:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error getting AI memories:", error)
      return []
    }
  }

  async createAIMemory(memory: Omit<AIMemory, "id" | "created_at">): Promise<AIMemory | null> {
    try {
      // Generate embedding if not provided
      const memoryWithEmbedding = { ...memory }

      if (!memory.embedding && config.openaiApiKey) {
        try {
          const embedding = await this.generateEmbedding(memory.content)
          memoryWithEmbedding.embedding = embedding
        } catch (embeddingError) {
          console.error("Error generating embedding:", embeddingError)
          // Continue without embedding
        }
      }

      const { data, error } = await this.supabase.from("ai_memories").insert([memoryWithEmbedding]).select().single()

      if (error) {
        console.error("Error creating AI memory:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error creating AI memory:", error)
      return null
    }
  }

  async searchAIMemories(query: string, aiMemberId?: string, limit = 5): Promise<AIMemory[]> {
    try {
      // Generate embedding for the query
      const embedding = await this.generateEmbedding(query)

      if (!embedding) {
        console.error("Failed to generate embedding for query")
        return []
      }

      // Use the search_ai_memories function
      const { data, error } = await this.supabase.rpc("search_ai_memories", {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: limit,
        filter_ai_family_member_id: aiMemberId || null,
      })

      if (error) {
        console.error("Error searching AI memories:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error searching AI memories:", error)
      return []
    }
  }

  // Files methods
  async getFiles(path?: string): Promise<File[]> {
    try {
      let query = this.supabase.from("files").select("*")

      if (path) {
        query = query.eq("path", path)
      }

      const { data, error } = await query.order("updated_at", { ascending: false })

      if (error) {
        console.error("Error getting files:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error getting files:", error)
      return []
    }
  }

  async getFileById(id: string): Promise<File | null> {
    try {
      const { data, error } = await this.supabase.from("files").select("*").eq("id", id).single()

      if (error) {
        console.error("Error getting file:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error getting file:", error)
      return null
    }
  }

  async createFile(file: Omit<File, "id" | "owner_id" | "created_at" | "updated_at">): Promise<File | null> {
    if (!this.currentUser) {
      console.error("User not authenticated")
      return null
    }

    try {
      const { data, error } = await this.supabase
        .from("files")
        .insert([
          {
            ...file,
            owner_id: this.currentUser.id,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error creating file:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error creating file:", error)
      return null
    }
  }

  async updateFile(id: string, updates: Partial<File>): Promise<File | null> {
    try {
      const { data, error } = await this.supabase.from("files").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("Error updating file:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error updating file:", error)
      return null
    }
  }

  async deleteFile(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("files").delete().eq("id", id)

      if (error) {
        console.error("Error deleting file:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error deleting file:", error)
      return false
    }
  }

  async incrementFileAccessCount(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.rpc("increment_file_access_count", {
        file_id: id,
      })

      if (error) {
        console.error("Error incrementing file access count:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error incrementing file access count:", error)
      return false
    }
  }

  // File permissions methods
  async getFilePermissions(fileId: string): Promise<FilePermission[]> {
    try {
      const { data, error } = await this.supabase.from("file_permissions").select("*").eq("file_id", fileId)

      if (error) {
        console.error("Error getting file permissions:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error getting file permissions:", error)
      return []
    }
  }

  async addFilePermission(permission: Omit<FilePermission, "id" | "created_at">): Promise<FilePermission | null> {
    try {
      const { data, error } = await this.supabase.from("file_permissions").insert([permission]).select().single()

      if (error) {
        console.error("Error adding file permission:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error adding file permission:", error)
      return null
    }
  }

  async removeFilePermission(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("file_permissions").delete().eq("id", id)

      if (error) {
        console.error("Error removing file permission:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error removing file permission:", error)
      return false
    }
  }

  // Vector embeddings methods
  async storeVectorEmbedding(
    content: string,
    metadata: Record<string, any> = {},
    aiMemberId?: string,
  ): Promise<VectorEmbedding | null> {
    if (!this.currentUser && !aiMemberId) {
      console.error("User not authenticated and no AI member ID provided")
      return null
    }

    try {
      // Generate embedding
      const embedding = await this.generateEmbedding(content)

      if (!embedding) {
        console.error("Failed to generate embedding")
        return null
      }

      const { data, error } = await this.supabase
        .from("vector_embeddings")
        .insert([
          {
            content,
            embedding,
            metadata,
            user_id: aiMemberId ? null : this.currentUser?.id,
            ai_family_member_id: aiMemberId || null,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error storing vector embedding:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error storing vector embedding:", error)
      return null
    }
  }

  async searchVectorEmbeddings(
    query: string,
    userId?: string,
    aiMemberId?: string,
    limit = 5,
  ): Promise<VectorEmbedding[]> {
    try {
      // Generate embedding for the query
      const embedding = await this.generateEmbedding(query)

      if (!embedding) {
        console.error("Failed to generate embedding for query")
        return []
      }

      // Use the search_similar_vectors function
      const { data, error } = await this.supabase.rpc("search_similar_vectors", {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: limit,
        filter_user_id: userId || null,
        filter_ai_family_member_id: aiMemberId || null,
      })

      if (error) {
        console.error("Error searching vector embeddings:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error searching vector embeddings:", error)
      return []
    }
  }

  // Helper methods
  private async generateEmbedding(text: string): Promise<number[] | null> {
    if (!config.openaiApiKey) {
      console.warn("OpenAI API key not found, using simulated embeddings")
      return this.simulateEmbedding(text)
    }

    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.openaiApiKey}`,
        },
        body: JSON.stringify({
          input: text,
          model: "text-embedding-ada-002",
        }),
      })

      if (!response.ok) {
        console.warn("Error generating embeddings from OpenAI, using simulated embeddings")
        return this.simulateEmbedding(text)
      }

      const data = await response.json()
      return data.data[0].embedding
    } catch (error) {
      console.error("Error generating embeddings:", error)
      return this.simulateEmbedding(text)
    }
  }

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

    // Generate a 1536-dimensional vector based on the text
    const vector: number[] = []
    for (let i = 0; i < 1536; i++) {
      // Use different seed for each dimension
      const seed = hash(text + i.toString())
      // Generate a value between -1 and 1
      vector.push((seed % 1000) / 500 - 1)
    }

    // Normalize the vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    return vector.map((val) => val / magnitude)
  }
}

export const supabaseService = new SupabaseService()
