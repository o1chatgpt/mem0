import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with better error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Validate configuration
let supabase: ReturnType<typeof createClient> | null = null
let isMem0ApiWorking = true

// Only create the client if we have the required configuration
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
} else {
  console.error("Supabase configuration is missing. Mem0 integration will use fallback mechanisms only.")
}

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

// Function to check if database operations are possible
function canUseDatabase(): boolean {
  return !!supabase
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

  // Check if we can use the database
  if (!canUseDatabase()) {
    console.error("Cannot store memory: Database is not configured")
    // Store in localStorage as a last resort
    try {
      if (typeof localStorage !== "undefined") {
        const key = `memory_${userId}_${aiFamily}`
        const existingMemories = JSON.parse(localStorage.getItem(key) || "[]")
        existingMemories.push({
          memory,
          created_at: new Date().toISOString(),
        })
        localStorage.setItem(key, JSON.stringify(existingMemories))
        return true
      }
    } catch (localStorageError) {
      console.error("Failed to store memory in localStorage:", localStorageError)
    }
    return false
  }

  try {
    // Convert aiFamily string to UUID using our mapping
    const aiFamilyUuid = getAiFamilyUuid(aiFamily)
    // Convert userId string to UUID using our mapping
    const userUuid = getUserUuid(userId)

    const { error } = await supabase!.from("ai_family_member_memories").insert([
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

  // Check if we can use the database
  if (!canUseDatabase()) {
    console.error("Cannot retrieve memories: Database is not configured")
    // Try to retrieve from localStorage as a last resort
    try {
      if (typeof localStorage !== "undefined") {
        const key = `memory_${userId}_${aiFamily}`
        const memories = JSON.parse(localStorage.getItem(key) || "[]")
        return memories.slice(0, limit)
      }
    } catch (localStorageError) {
      console.error("Failed to retrieve memories from localStorage:", localStorageError)
    }
    return []
  }

  try {
    // Convert aiFamily string to UUID using our mapping
    const aiFamilyUuid = getAiFamilyUuid(aiFamily)
    // Convert userId string to UUID using our mapping
    const userUuid = getUserUuid(userId)

    const { data, error } = await supabase!
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

  // Check if we can use the database
  if (!canUseDatabase()) {
    console.error("Cannot search memories: Database is not configured")
    // Try to search in localStorage as a last resort
    try {
      if (typeof localStorage !== "undefined") {
        const key = `memory_${userId}_${aiFamily}`
        const memories = JSON.parse(localStorage.getItem(key) || "[]")
        return memories.filter((memory: any) => memory.memory.includes(query)).slice(0, limit)
      }
    } catch (localStorageError) {
      console.error("Failed to search memories in localStorage:", localStorageError)
    }
    return []
  }

  try {
    // Convert aiFamily string to UUID using our mapping
    const aiFamilyUuid = getAiFamilyUuid(aiFamily)
    // Convert userId string to UUID using our mapping
    const userUuid = getUserUuid(userId)

    const { data, error } = await supabase!
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

// Function to check Mem0 API connection with better diagnostics
export async function checkMem0ApiConnection(
  customApiKey?: string,
  customApiUrl?: string,
): Promise<"connected" | "disconnected"> {
  try {
    // Validate inputs
    if (!customApiKey || !customApiUrl) {
      console.log("Missing API key or URL for Mem0 connection check")
      return "disconnected"
    }

    // Log connection attempt (without exposing full API key)
    console.log(`Attempting to connect to Mem0 API at ${customApiUrl} with key ${customApiKey.substring(0, 4)}...`)

    // Format the base URL correctly
    const baseUrl = customApiUrl.endsWith("/") ? customApiUrl.slice(0, -1) : customApiUrl

    // Try direct connection first (most reliable)
    try {
      // Try a simple HEAD request to the base URL
      const response = await fetch(baseUrl, {
        method: "HEAD",
        headers: {
          Authorization: `Bearer ${customApiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      })

      console.log(`Direct connection to ${baseUrl}: ${response.status} ${response.statusText}`)

      // Even a 401 or 403 would indicate the API exists
      if (response.ok || response.status === 401 || response.status === 403) {
        console.log("Mem0 API exists at the provided URL")
        return "connected"
      }
    } catch (error) {
      console.error(`Direct connection to ${baseUrl} failed:`, error)
    }

    // Try multiple possible endpoints
    const possibleEndpoints = [
      `${baseUrl}/api/health`,
      `${baseUrl}/health`,
      `${baseUrl}/api/status`,
      `${baseUrl}/status`,
      `${baseUrl}/memories`, // Try the main API endpoint as a fallback
      `${baseUrl}/api/memory/search`, // Another common endpoint
    ]

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`)
        const response = await fetch(endpoint, {
          method: endpoint.includes("memories") || endpoint.includes("search") ? "HEAD" : "GET",
          headers: {
            Authorization: `Bearer ${customApiKey}`,
          },
          signal: AbortSignal.timeout(3000),
        })

        console.log(`Response from ${endpoint}: ${response.status} ${response.statusText}`)

        // For the memories endpoint, even a 401 or 403 would indicate the API exists
        if (
          response.ok ||
          ((endpoint.includes("memories") || endpoint.includes("search")) &&
            (response.status === 401 || response.status === 403))
        ) {
          console.log(`Mem0 API connection successful via ${endpoint}`)
          return "connected"
        }
      } catch (error) {
        console.error(`Connection test failed for endpoint ${endpoint}:`, error)
      }
    }

    // If we've tried all endpoints and none worked, try the server API
    try {
      console.log("Trying server API endpoint for connection check")
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
        console.log("Server API check result:", data)
        return data.success && data.status === "connected" ? "connected" : "disconnected"
      }

      console.log("Server API check failed:", await response.text())
    } catch (error) {
      console.error("Error with server API check:", error)
    }

    console.log("All connection attempts failed, marking as disconnected")
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
