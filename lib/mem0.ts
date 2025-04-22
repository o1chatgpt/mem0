import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export interface Memory {
  id: string
  memory: string
  created_at: string
  ai_family_member: string
}

export async function getMemories(aiFamily: string, limit = 10): Promise<Memory[]> {
  try {
    const { data, error } = await supabase
      .from("ai_family_member_memories")
      .select("*")
      .eq("ai_family_member", aiFamily)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching memories:", error)
    return []
  }
}

export async function addMemory(aiFamily: string, memory: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("ai_family_member_memories").insert([
      {
        ai_family_member: aiFamily,
        memory,
      },
    ])

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error adding memory:", error)
    return false
  }
}

export async function searchMemories(aiFamily: string, query: string, limit = 10): Promise<Memory[]> {
  try {
    // This is a simple search implementation
    // For production, consider using Supabase's full-text search capabilities
    const { data, error } = await supabase
      .from("ai_family_member_memories")
      .select("*")
      .eq("ai_family_member", aiFamily)
      .ilike("memory", `%${query}%`)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error searching memories:", error)
    return []
  }
}

// Function to integrate with Mem0 API
export async function integrateWithMem0(userId: string, message: string): Promise<void> {
  try {
    const apiKey = process.env.MEM0_API_KEY
    const apiUrl = process.env.MEM0_API_URL

    if (!apiKey || !apiUrl) {
      console.warn("Mem0 API key or URL not configured")
      return
    }

    // This is where you would integrate with the Mem0 API
    // For now, we'll just log the message
    console.log(`Mem0 integration: Storing memory for user ${userId}: ${message}`)
  } catch (error) {
    console.error("Error integrating with Mem0:", error)
  }
}
