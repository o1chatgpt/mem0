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
  async getUser(userId: string) {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) throw error
    return data
  }

  async createUser(userData: any) {
    const { data, error } = await supabase.from("users").insert(userData).select().single()

    if (error) throw error
    return data
  }

  async updateUser(userId: string, userData: any) {
    const { data, error } = await supabase.from("users").update(userData).eq("id", userId).select().single()

    if (error) throw error
    return data
  }

  async getFiles(userId: string) {
    const { data, error } = await supabase.from("files").select("*").eq("user_id", userId)

    if (error) throw error
    return data
  }

  async getFile(fileId: string) {
    const { data, error } = await supabase.from("files").select("*").eq("id", fileId).single()

    if (error) throw error
    return data
  }

  async createFile(fileData: any) {
    const { data, error } = await supabase.from("files").insert(fileData).select().single()

    if (error) throw error
    return data
  }

  async updateFile(fileId: string, fileData: any) {
    const { data, error } = await supabase.from("files").update(fileData).eq("id", fileId).select().single()

    if (error) throw error
    return data
  }

  async deleteFile(fileId: string) {
    const { error } = await supabase.from("files").delete().eq("id", fileId)

    if (error) throw error
    return true
  }

  async getCollaborators(fileId: string) {
    const { data, error } = await supabase
      .from("collaborators")
      .select("*, users(id, email, name)")
      .eq("file_id", fileId)

    if (error) throw error
    return data
  }

  async addCollaborator(fileId: string, userId: string, permission: string) {
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
  }

  async removeCollaborator(fileId: string, userId: string) {
    const { error } = await supabase.from("collaborators").delete().eq("file_id", fileId).eq("user_id", userId)

    if (error) throw error
    return true
  }

  async getAIFamilyMembers(): Promise<AIFamilyMember[]> {
    const { data, error } = await supabase.from("ai_family_members").select("*")

    if (error) throw error
    return data as AIFamilyMember[]
  }

  async getAIFamilyMember(memberId: string): Promise<AIFamilyMember | null> {
    const { data, error } = await supabase.from("ai_family_members").select("*").eq("id", memberId).single()

    if (error) throw error
    return data as AIFamilyMember
  }

  async createAIFamilyMember(
    member: Omit<AIFamilyMember, "id" | "created_at" | "updated_at" | "created_by">,
  ): Promise<AIFamilyMember> {
    const { data, error } = await supabase
      .from("ai_family_members")
      .insert([{ ...member, created_by: supabase.auth.currentUser?.id }])
      .select()
      .single()

    if (error) throw error
    return data as AIFamilyMember
  }

  async updateAIFamilyMember(memberId: string, updates: Partial<AIFamilyMember>): Promise<AIFamilyMember> {
    const { data, error } = await supabase
      .from("ai_family_members")
      .update(updates)
      .eq("id", memberId)
      .select()
      .single()

    if (error) throw error
    return data as AIFamilyMember
  }

  async deleteAIFamilyMember(memberId: string): Promise<boolean> {
    const { error } = await supabase.from("ai_family_members").delete().eq("id", memberId)

    if (error) throw error
    return true
  }

  async getAIMemories(memberId: string): Promise<AIMemory[]> {
    const { data, error } = await supabase.from("ai_memories").select("*").eq("ai_family_member_id", memberId)

    if (error) throw error
    return data as AIMemory[]
  }

  async createAIMemory(memory: Omit<AIMemory, "id" | "created_at">): Promise<AIMemory> {
    const { data, error } = await supabase.from("ai_memories").insert([memory]).select().single()

    if (error) throw error
    return data as AIMemory
  }

  async searchAIMemories(query: string, memberId?: string, limit = 5): Promise<AIMemory[]> {
    try {
      const { data, error } = await supabase.rpc("search_ai_memories", {
        query_embedding: [], // Replace with actual embedding generation
        match_threshold: 0.7,
        match_count: limit,
        filter_ai_family_member_id: memberId || null,
      })

      if (error) {
        throw error
      }

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
