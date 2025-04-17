import { createClient } from "@supabase/supabase-js"
import { serverConfig } from "./config"

// Define types for AI Family Member and AI Memory
export interface AIFamilyMember {
  id: string
  name: string
  description: string
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

// Create a Supabase client for server-side operations
const supabase = createClient(serverConfig.supabaseUrl, serverConfig.supabaseServiceKey)

// Service class for Supabase operations
class SupabaseService {
  private initialized = false

  async initialize() {
    if (this.initialized) return true

    try {
      // Check if we can connect to Supabase
      const { data, error } = await supabase.from("users").select("count").limit(1)

      if (error) {
        console.error("Error initializing Supabase service:", error)
        return false
      }

      this.initialized = true
      return true
    } catch (error) {
      console.error("Error initializing Supabase service:", error)
      return false
    }
  }

  async getUser(userId: string) {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error getting user:", error)
      return null
    }
  }

  async createUser(userData: any) {
    try {
      const { data, error } = await supabase.from("users").insert(userData).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating user:", error)
      return null
    }
  }

  async updateUser(userId: string, userData: any) {
    try {
      const { data, error } = await supabase.from("users").update(userData).eq("id", userId).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error updating user:", error)
      return null
    }
  }

  async getFiles(userId: string) {
    try {
      const { data, error } = await supabase.from("files").select("*").eq("user_id", userId)

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error getting files:", error)
      return []
    }
  }

  async getFile(fileId: string) {
    try {
      const { data, error } = await supabase.from("files").select("*").eq("id", fileId).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error getting file:", error)
      return null
    }
  }

  async createFile(fileData: any) {
    try {
      const { data, error } = await supabase.from("files").insert(fileData).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating file:", error)
      return null
    }
  }

  async updateFile(fileId: string, fileData: any) {
    try {
      const { data, error } = await supabase.from("files").update(fileData).eq("id", fileId).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error updating file:", error)
      return null
    }
  }

  async deleteFile(fileId: string) {
    try {
      const { error } = await supabase.from("files").delete().eq("id", fileId)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error deleting file:", error)
      return false
    }
  }

  async getCollaborators(fileId: string) {
    try {
      const { data, error } = await supabase
        .from("collaborators")
        .select("*, users(id, email, name)")
        .eq("file_id", fileId)

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error getting collaborators:", error)
      return []
    }
  }

  async addCollaborator(fileId: string, userId: string, permission: string) {
    try {
      const { data, error } = await supabase
        .from("collaborators")
        .insert({
          file_id: fileId,
          user_id: userId,
          permission,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error adding collaborator:", error)
      return null
    }
  }

  async removeCollaborator(fileId: string, userId: string) {
    try {
      const { error } = await supabase.from("collaborators").delete().eq("file_id", fileId).eq("user_id", userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error removing collaborator:", error)
      return false
    }
  }

  async getAIFamilyMembers(): Promise<AIFamilyMember[]> {
    try {
      const { data, error } = await supabase.from("ai_family_members").select("*")

      if (error) throw error
      return data as AIFamilyMember[]
    } catch (error) {
      console.error("Error getting AI family members:", error)
      return []
    }
  }

  async getAIFamilyMember(memberId: string): Promise<AIFamilyMember | null> {
    try {
      const { data, error } = await supabase.from("ai_family_members").select("*").eq("id", memberId).single()

      if (error) throw error
      return data as AIFamilyMember
    } catch (error) {
      console.error("Error getting AI family member:", error)
      return null
    }
  }

  async createAIFamilyMember(
    member: Omit<AIFamilyMember, "id" | "created_at" | "updated_at" | "created_by">,
    userId: string,
  ): Promise<AIFamilyMember | null> {
    try {
      const { data, error } = await supabase
        .from("ai_family_members")
        .insert([{ ...member, created_by: userId }])
        .select()
        .single()

      if (error) throw error
      return data as AIFamilyMember
    } catch (error) {
      console.error("Error creating AI family member:", error)
      return null
    }
  }

  async updateAIFamilyMember(memberId: string, updates: Partial<AIFamilyMember>): Promise<AIFamilyMember | null> {
    try {
      const { data, error } = await supabase
        .from("ai_family_members")
        .update(updates)
        .eq("id", memberId)
        .select()
        .single()

      if (error) throw error
      return data as AIFamilyMember
    } catch (error) {
      console.error("Error updating AI family member:", error)
      return null
    }
  }

  async deleteAIFamilyMember(memberId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("ai_family_members").delete().eq("id", memberId)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error deleting AI family member:", error)
      return false
    }
  }

  async getAIMemories(memberId: string): Promise<AIMemory[]> {
    try {
      const { data, error } = await supabase.from("ai_memories").select("*").eq("ai_family_member_id", memberId)

      if (error) throw error
      return data as AIMemory[]
    } catch (error) {
      console.error("Error getting AI memories:", error)
      return []
    }
  }

  async createAIMemory(memory: Omit<AIMemory, "id" | "created_at">): Promise<AIMemory | null> {
    try {
      const { data, error } = await supabase.from("ai_memories").insert([memory]).select().single()

      if (error) throw error
      return data as AIMemory
    } catch (error) {
      console.error("Error creating AI memory:", error)
      return null
    }
  }

  async searchAIMemories(query: string, memberId?: string, limit = 5): Promise<AIMemory[]> {
    try {
      // This is a simplified implementation - in a real app, you'd use vector search
      const { data, error } = await supabase.from("ai_memories").select("*").ilike("content", `%${query}%`).limit(limit)

      if (error) throw error
      return data as AIMemory[]
    } catch (error) {
      console.error("Error searching AI memories:", error)
      return []
    }
  }
}

// Create and export an instance of the service
export const supabaseService = new SupabaseService()

// Also export the class for extensibility
export default SupabaseService
