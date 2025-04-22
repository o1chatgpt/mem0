import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Adds a pair of contradictory memories with the same timestamp
 */
export async function addContradictoryMemories(
  aiFamily: string,
  memory1: string,
  memory2: string,
  userId = "default_user",
  timestamp?: string,
): Promise<boolean> {
  try {
    // Use provided timestamp or generate current time
    const memoryTimestamp = timestamp || new Date().toISOString()

    // Insert both memories with the same timestamp
    const { error } = await supabase.from("ai_family_member_memories").insert([
      {
        ai_family_member_id: aiFamily,
        user_id: userId,
        memory: memory1,
        created_at: memoryTimestamp,
        updated_at: memoryTimestamp,
      },
      {
        ai_family_member_id: aiFamily,
        user_id: userId,
        memory: memory2,
        created_at: memoryTimestamp,
        updated_at: memoryTimestamp,
      },
    ])

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error adding contradictory memories:", error)
    return false
  }
}

/**
 * Adds multiple sets of contradictory memories
 */
export async function addMultipleContradictoryMemorySets(
  aiFamily: string,
  memorySets: Array<{ memory1: string; memory2: string; timestamp?: string }>,
  userId = "default_user",
): Promise<boolean> {
  try {
    for (const set of memorySets) {
      const success = await addContradictoryMemories(aiFamily, set.memory1, set.memory2, userId, set.timestamp)
      if (!success) return false
    }
    return true
  } catch (error) {
    console.error("Error adding multiple contradictory memory sets:", error)
    return false
  }
}
