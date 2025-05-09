import { createClient } from "@supabase/supabase-js"

// Create a singleton for the Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  }
  return supabaseClient
}

export async function initializeMemorySystem() {
  const supabase = getSupabaseClient()

  if (!supabase) {
    throw new Error("Supabase client not initialized. Check your environment variables.")
  }

  // Check if the memories table exists
  const { error: checkError } = await supabase.from("memories").select("id").limit(1).single()

  // If the table doesn't exist, create it
  if (checkError && checkError.code === "PGRST116") {
    await createMemoryTables(supabase)
  }

  return { success: true }
}

async function createMemoryTables(supabase: ReturnType<typeof createClient>) {
  // Create the memories table
  await supabase.rpc("create_memories_table", {})

  // Create the memory_categories table
  await supabase.rpc("create_memory_categories_table", {})

  // Create the file_memories table
  await supabase.rpc("create_file_memories_table", {})

  // Create default categories
  await supabase.from("memory_categories").insert([
    { name: "Personal", icon: "user", color: "blue" },
    { name: "Work", icon: "briefcase", color: "green" },
    { name: "Ideas", icon: "lightbulb", color: "yellow" },
    { name: "Notes", icon: "file-text", color: "purple" },
  ])
}

export async function associateFileWithMemory(fileId: string, memoryId: string) {
  const supabase = getSupabaseClient()

  if (!supabase) {
    throw new Error("Supabase client not initialized")
  }

  const { error } = await supabase.from("file_memories").insert({ file_id: fileId, memory_id: memoryId })

  if (error) {
    throw new Error(`Failed to associate file with memory: ${error.message}`)
  }

  return { success: true }
}

export async function getFileMemories(fileId: string) {
  const supabase = getSupabaseClient()

  if (!supabase) {
    throw new Error("Supabase client not initialized")
  }

  const { data, error } = await supabase.from("file_memories").select("memories(*)").eq("file_id", fileId)

  if (error) {
    throw new Error(`Failed to get file memories: ${error.message}`)
  }

  return data?.map((item) => item.memories) || []
}
