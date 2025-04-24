import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// Function to integrate with Mem0 API
export async function storeMemoryWithMem0(userId: string, aiFamily: string, memory: string): Promise<boolean> {
  try {
    const apiKey = process.env.MEM0_API_KEY
    const apiUrl = process.env.MEM0_API_URL

    if (!apiKey || !apiUrl) {
      console.warn("Mem0 API key or URL not configured")

      // Fall back to storing in our database
      const { error } = await supabase.from("ai_family_member_memories").insert([
        {
          ai_family_member_id: aiFamily,
          user_id: userId,
          memory,
        },
      ])

      if (error) throw error
      return true
    }

    // This is where we would integrate with the Mem0 API
    console.log(`Mem0 integration: Storing memory for user ${userId} and AI ${aiFamily}: ${memory}`)

    // For now, we'll just store in our database
    const { error } = await supabase.from("ai_family_member_memories").insert([
      {
        ai_family_member_id: aiFamily,
        user_id: userId,
        memory,
      },
    ])

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error storing memory:", error)
    return false
  }
}

// Function to retrieve memories from Mem0 API
export async function getMemoriesFromMem0(userId: string, aiFamily: string, limit = 10): Promise<any[]> {
  try {
    const apiKey = process.env.MEM0_API_KEY
    const apiUrl = process.env.MEM0_API_URL

    if (!apiKey || !apiUrl) {
      console.warn("Mem0 API key or URL not configured")

      // Fall back to retrieving from our database
      const { data, error } = await supabase
        .from("ai_family_member_memories")
        .select("*")
        .eq("ai_family_member_id", aiFamily)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    }

    // This is where we would integrate with the Mem0 API
    console.log(`Mem0 integration: Retrieving memories for user ${userId} and AI ${aiFamily}`)

    // For now, we'll just retrieve from our database
    const { data, error } = await supabase
      .from("ai_family_member_memories")
      .select("*")
      .eq("ai_family_member_id", aiFamily)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error retrieving memories:", error)
    return []
  }
}

// Function to search memories from Mem0 API
export async function searchMemoriesFromMem0(
  userId: string,
  aiFamily: string,
  query: string,
  limit = 10,
): Promise<any[]> {
  try {
    const apiKey = process.env.MEM0_API_KEY
    const apiUrl = process.env.MEM0_API_URL

    if (!apiKey || !apiUrl) {
      console.warn("Mem0 API key or URL not configured")

      // Fall back to searching in our database
      const { data, error } = await supabase
        .from("ai_family_member_memories")
        .select("*")
        .eq("ai_family_member_id", aiFamily)
        .eq("user_id", userId)
        .ilike("memory", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    }

    // This is where we would integrate with the Mem0 API
    console.log(`Mem0 integration: Searching memories for user ${userId} and AI ${aiFamily} with query: ${query}`)

    // For now, we'll just search in our database
    const { data, error } = await supabase
      .from("ai_family_member_memories")
      .select("*")
      .eq("ai_family_member_id", aiFamily)
      .eq("user_id", userId)
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
