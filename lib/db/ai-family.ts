import { createClient } from "@/lib/supabase/server"

export interface AIFamilyMember {
  id: string
  name: string
  description: string
  avatar_url: string
  personality: string
  created_at: string
  updated_at: string
  user_id: string
  is_active: boolean
  memory_id?: string
}

export async function getAIFamilyMembers(userId?: string): Promise<AIFamilyMember[]> {
  const supabase = createClient()

  let query = supabase.from("ai_family_members").select("*").order("created_at", { ascending: false })

  if (userId) {
    query = query.eq("user_id", userId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching AI family members:", error)
    throw new Error(`Failed to fetch AI family members: ${error.message}`)
  }

  return data || []
}

export async function createAIFamilyMember(
  member: Omit<AIFamilyMember, "id" | "created_at" | "updated_at">,
): Promise<AIFamilyMember> {
  const supabase = createClient()

  const { data, error } = await supabase.from("ai_family_members").insert([member]).select().single()

  if (error) {
    console.error("Error creating AI family member:", error)
    throw new Error(`Failed to create AI family member: ${error.message}`)
  }

  return data
}

export async function updateAIFamilyMember(id: string, updates: Partial<AIFamilyMember>): Promise<AIFamilyMember> {
  const supabase = createClient()

  const { data, error } = await supabase.from("ai_family_members").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating AI family member:", error)
    throw new Error(`Failed to update AI family member: ${error.message}`)
  }

  return data
}

export async function deleteAIFamilyMember(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from("ai_family_members").delete().eq("id", id)

  if (error) {
    console.error("Error deleting AI family member:", error)
    throw new Error(`Failed to delete AI family member: ${error.message}`)
  }
}
