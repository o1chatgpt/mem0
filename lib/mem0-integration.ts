import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// Add a flag to track if Mem0 API is working
let isMem0ApiWorking = true

// Define a mapping of string identifiers to valid UUIDs for database compatibility
const AI_FAMILY_UUID_MAP: Record<string, string> = {
  // Use consistent UUIDs for each AI family member
  file_manager: "00000000-0000-0000-0000-000000000001",
  lyra: "00000000-0000-0000-0000-000000000002",
  sophia: "00000000-0000-0000-0000-000000000003",
  kara: "00000000-0000-0000-0000-000000000004",
  stan: "00000000-0000-0000-0000-000000000005",
  dan: "00000000-0000-0000-0000-000000000006",
  mem0: "00000000-0000-0000-0000-000000000007",
  // Add more mappings as needed
}

// Add a mapping for user IDs to UUIDs at the top of the file, after the AI_FAMILY_UUID_MAP
// Define a mapping of user IDs to valid UUIDs for database compatibility
const USER_UUID_MAP: Record<string, string> = {
  // Use consistent UUIDs for each user
  default_user: "00000000-0000-0000-0000-000000000010",
  // Add more mappings as needed
}

// Helper function to get UUID for an AI family member
function getAiFamilyUuid(aiFamily: string): string {
  return AI_FAMILY_UUID_MAP[aiFamily] || "00000000-0000-0000-0000-000000000000"
}

// Add a helper function to get UUID for a user
function getUserUuid(userId: string): string {
  return USER_UUID_MAP[userId] || "00000000-0000-0000-0000-000000000000"
}

// Function to integrate with Mem0 API
export async function storeMemoryWithMem0(userId: string, aiFamily: string, memory: string): Promise<boolean> {
  // If we've already determined the API isn't working, skip the API call entirely
  if (!isMem0ApiWorking) {
    console.log("Skipping Mem0 API call - API previously failed")
    return fallbackToStoreDatabase(userId, aiFamily, memory)
  }

  try {
    // Get custom API settings from localStorage if available
    const savedSettings = typeof localStorage !== "undefined" ? localStorage.getItem("mem0Settings") : null
    let customApiKey = "",
      customApiUrl = ""

    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      customApiKey = settings.apiKey || ""
      customApiUrl = settings.apiUrl || ""
    }

    // If custom settings are available, use them
    if (customApiKey && customApiUrl) {
      try {
        // Call the server API endpoint with custom credentials
        const response = await fetch("/api/mem0", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation: "store",
            userId,
            aiFamily,
            memory,
            customApiKey,
            customApiUrl,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            return true
          }
        }
      } catch (error) {
        console.error("Error calling server API with custom credentials:", error)
      }
    }

    // Try with server-side credentials
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "store",
          userId,
          aiFamily,
          memory,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          return true
        }
      }
    } catch (error) {
      console.error("Error calling server API:", error)
    }

    // If all API attempts failed
    console.error("All Mem0 API endpoints failed for storing memory")
    isMem0ApiWorking = false
    return fallbackToStoreDatabase(userId, aiFamily, memory)
  } catch (error) {
    console.error("Error storing memory:", error)
    return fallbackToStoreDatabase(userId, aiFamily, memory)
  }
}

// Add this helper function for database store fallback
async function fallbackToStoreDatabase(userId: string, aiFamily: string, memory: string): Promise<boolean> {
  console.log(`Falling back to database storage for memory: ${memory}`)
  try {
    // Convert aiFamily string to UUID using our mapping
    const aiFamilyUuid = getAiFamilyUuid(aiFamily)
    // Convert userId string to UUID using our mapping
    const userUuid = getUserUuid(userId)

    const { error } = await supabase.from("ai_family_member_memories").insert([
      {
        ai_family_member_id: aiFamilyUuid, // Use the UUID instead of the string
        user_id: userUuid, // Use the UUID instead of the string
        memory,
      },
    ])

    if (error) {
      console.error("Database insert error:", error)
      throw error
    }
    return true
  } catch (dbError) {
    console.error("Error storing in database:", dbError)
    return false
  }
}

// Function to retrieve memories from Mem0 API
export async function getMemoriesFromMem0(userId: string, aiFamily: string, limit = 10): Promise<any[]> {
  // IMPORTANT: Skip API verification entirely for preferences provider
  // This is a special case to avoid blocking the UI during initial load
  const callerName = new Error().stack?.split("\n")[2]?.trim() || ""
  const isCalledFromPreferencesProvider = callerName.includes("loadPreferences")

  if (isCalledFromPreferencesProvider) {
    console.log("Called from preferences provider - skipping API verification and using local database directly")
    return fallbackToDatabase(userId, aiFamily, limit)
  }

  // If we've already determined the API isn't working, skip the API call entirely
  if (!isMem0ApiWorking) {
    console.log("Skipping Mem0 API call - API previously failed")
    return fallbackToDatabase(userId, aiFamily, limit)
  }

  try {
    // Get custom API settings from localStorage if available
    const savedSettings = typeof localStorage !== "undefined" ? localStorage.getItem("mem0Settings") : null
    let customApiKey = "",
      customApiUrl = ""

    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      customApiKey = settings.apiKey || ""
      customApiUrl = settings.apiUrl || ""
    }

    // If custom settings are available, use them
    if (customApiKey && customApiUrl) {
      try {
        // Call the server API endpoint with custom credentials
        const response = await fetch("/api/mem0", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation: "get",
            userId,
            aiFamily,
            limit,
            customApiKey,
            customApiUrl,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.memories && data.memories.length > 0) {
            return data.memories
          }
        }
      } catch (error) {
        console.error("Error calling server API with custom credentials:", error)
      }
    }

    // Try with server-side credentials
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "get",
          userId,
          aiFamily,
          limit,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.memories && data.memories.length > 0) {
          return data.memories
        }
      }
    } catch (error) {
      console.error("Error calling server API:", error)
    }

    // If all API attempts failed
    console.log("All Mem0 API endpoints failed - falling back to database")
    isMem0ApiWorking = false
    return fallbackToDatabase(userId, aiFamily, limit)
  } catch (error) {
    console.log("Error retrieving memories:", error)
    return fallbackToDatabase(userId, aiFamily, limit)
  }
}

// Add this helper function for database fallback
async function fallbackToDatabase(userId: string, aiFamily: string, limit: number): Promise<any[]> {
  console.log(`Falling back to database retrieval for memories`)
  try {
    // Convert aiFamily string to UUID using our mapping
    const aiFamilyUuid = getAiFamilyUuid(aiFamily)
    // Convert userId string to UUID using our mapping
    const userUuid = getUserUuid(userId)

    const { data, error } = await supabase
      .from("ai_family_member_memories")
      .select("*")
      .eq("ai_family_member_id", aiFamilyUuid) // Use the UUID instead of the string
      .eq("user_id", userUuid) // Use the UUID instead of the string
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Database query error:", error)
      throw error
    }
    return data || []
  } catch (dbError) {
    console.error("Error retrieving from database:", dbError)
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
  // If we've already determined the API isn't working, skip the API call entirely
  if (!isMem0ApiWorking) {
    console.log("Skipping Mem0 API call - API previously failed")
    return fallbackToSearchDatabase(userId, aiFamily, query, limit)
  }

  try {
    // Get custom API settings from localStorage if available
    const savedSettings = typeof localStorage !== "undefined" ? localStorage.getItem("mem0Settings") : null
    let customApiKey = "",
      customApiUrl = ""

    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      customApiKey = settings.apiKey || ""
      customApiUrl = settings.apiUrl || ""
    }

    // If custom settings are available, use them
    if (customApiKey && customApiUrl) {
      try {
        // Call the server API endpoint with custom credentials
        const response = await fetch("/api/mem0", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation: "search",
            userId,
            aiFamily,
            query,
            limit,
            customApiKey,
            customApiUrl,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.memories) {
            return data.memories
          }
        }
      } catch (error) {
        console.error("Error calling server API with custom credentials:", error)
      }
    }

    // Try with server-side credentials
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "search",
          userId,
          aiFamily,
          query,
          limit,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.memories) {
          return data.memories
        }
      }
    } catch (error) {
      console.error("Error calling server API:", error)
    }

    // If all API attempts failed
    console.log("All Mem0 API endpoints failed for search - falling back to database")
    isMem0ApiWorking = false
    return fallbackToSearchDatabase(userId, aiFamily, query, limit)
  } catch (error) {
    console.log("Error searching memories:", error)
    return fallbackToSearchDatabase(userId, aiFamily, query, limit)
  }
}

// Add this helper function for database search fallback
async function fallbackToSearchDatabase(
  userId: string,
  aiFamily: string,
  query: string,
  limit: number,
): Promise<any[]> {
  console.log(`Falling back to database search for memories with query: ${query}`)
  try {
    // Convert aiFamily string to UUID using our mapping
    const aiFamilyUuid = getAiFamilyUuid(aiFamily)
    // Convert userId string to UUID using our mapping
    const userUuid = getUserUuid(userId)

    const { data, error } = await supabase
      .from("ai_family_member_memories")
      .select("*")
      .eq("ai_family_member_id", aiFamilyUuid) // Use the UUID instead of the string
      .eq("user_id", userUuid) // Use the UUID instead of the string
      .ilike("memory", `%${query}%`)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Database search error:", error)
      throw error
    }
    return data || []
  } catch (dbError) {
    console.error("Error searching from database:", dbError)
    return []
  }
}

// Function to check Mem0 API connection
export async function checkMem0ApiConnection(
  customApiKey?: string,
  customApiUrl?: string,
): Promise<"connected" | "disconnected"> {
  try {
    // Call the server API endpoint
    const response = await fetch("/api/mem0", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "check",
        customApiKey,
        customApiUrl,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return data.success && data.status === "connected" ? "connected" : "disconnected"
    }

    return "disconnected"
  } catch (error) {
    console.error("Error checking Mem0 API connection:", error)
    return "disconnected"
  }
}

// Function to track file operations in Mem0
export async function trackFileOperation(
  userId: string,
  operation: string,
  filePath: string,
  fileName: string,
  details?: string,
): Promise<boolean> {
  const memory = `User ${operation} file "${fileName}" at path "${filePath}"${details ? `. ${details}` : ""}`
  return storeMemoryWithMem0(userId, "file_manager", memory)
}

// Function to track user preferences in Mem0
export async function trackUserPreference(userId: string, preference: string, value: string): Promise<boolean> {
  const memory = `User preference: ${preference} set to ${value}`
  return storeMemoryWithMem0(userId, "file_manager", memory)
}

// Function to track search queries in Mem0
export async function trackSearchQuery(userId: string, query: string): Promise<boolean> {
  const memory = `User searched for "${query}"`
  return storeMemoryWithMem0(userId, "file_manager", memory)
}
