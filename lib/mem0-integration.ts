import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with better error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Validate configuration
let supabase: ReturnType<typeof createClient> | null = null
let isMem0ApiWorking = true

// Only create the client if we have the required configuration
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey)
    console.log("Supabase client initialized successfully")
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error)
    supabase = null
  }
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

// Function to safely store in localStorage
function safelyStoreInLocalStorage(key: string, data: any): boolean {
  if (typeof window === "undefined") return false

  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error("Failed to store in localStorage:", error)
    return false
  }
}

// Function to safely get from localStorage
function safelyGetFromLocalStorage(key: string): any {
  if (typeof window === "undefined") return null

  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error("Failed to get from localStorage:", error)
    return null
  }
}

// Function to integrate with Mem0 API
export async function storeMemoryWithMem0(userId: string, aiFamily: string, memory: string): Promise<boolean> {
  // If we're in a server context, skip API calls and go straight to fallback
  if (typeof window === "undefined") {
    console.log("Server context detected, using fallback storage mechanism")
    return fallbackToStoreDatabase(userId, aiFamily, memory)
  }

  // If we've already determined the API isn't working, skip the API call entirely
  if (!isMem0ApiWorking) {
    console.log("Skipping Mem0 API call - API previously failed")
    return fallbackToStoreDatabase(userId, aiFamily, memory)
  }

  try {
    // Get custom API settings from localStorage if available
    let customApiKey = "",
      customApiUrl = ""

    try {
      const savedSettings = safelyGetFromLocalStorage("mem0Settings")
      if (savedSettings) {
        customApiKey = savedSettings.apiKey || ""
        customApiUrl = savedSettings.apiUrl || ""
      }
    } catch (localStorageError) {
      console.error("Error accessing localStorage:", localStorageError)
    }

    // If custom settings are available, use them
    if (customApiKey && customApiUrl) {
      try {
        console.log(`Attempting to store memory using custom API at ${customApiUrl}`)

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
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(10000),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            console.log("Successfully stored memory using custom API")
            return true
          } else {
            console.warn("API returned success: false", data)
          }
        } else {
          console.warn(`API returned status ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        console.error("Error calling server API with custom credentials:", error)
      }
    } else {
      console.log("No custom API credentials available")
    }

    // Try with server-side credentials
    try {
      console.log("Attempting to store memory using server-side API")

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
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          console.log("Successfully stored memory using server-side API")
          return true
        } else {
          console.warn("Server API returned success: false", data)
        }
      } else {
        console.warn(`Server API returned status ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error calling server API:", error)
    }

    // If all API attempts failed
    console.error("All Mem0 API endpoints failed for storing memory")
    isMem0ApiWorking = false
    return fallbackToStoreDatabase(userId, aiFamily, memory)
  } catch (error) {
    console.error("Error in storeMemoryWithMem0:", error)
    return fallbackToStoreDatabase(userId, aiFamily, memory)
  }
}

// Add this helper function for database store fallback
async function fallbackToStoreDatabase(userId: string, aiFamily: string, memory: string): Promise<boolean> {
  console.log(
    `Falling back to database storage for memory: ${memory.substring(0, 50)}${memory.length > 50 ? "..." : ""}`,
  )

  // Check if we can use the database
  if (!canUseDatabase()) {
    console.log("Database not configured, trying localStorage fallback")
    // Store in localStorage as a last resort
    try {
      if (typeof window !== "undefined") {
        const key = `memory_${userId}_${aiFamily}`
        const existingMemories = safelyGetFromLocalStorage(key) || []
        existingMemories.push({
          id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          memory,
          created_at: new Date().toISOString(),
          type: memory.toLowerCase().includes("file")
            ? "file_operation"
            : memory.toLowerCase().includes("search")
              ? "search"
              : memory.toLowerCase().includes("preference")
                ? "preference"
                : "custom",
        })

        const stored = safelyStoreInLocalStorage(key, existingMemories)
        if (stored) {
          console.log("Successfully stored memory in localStorage")
          return true
        } else {
          console.error("Failed to store in localStorage")
        }
      } else {
        console.log("Window not defined, cannot use localStorage")
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

    console.log(
      `Storing memory in database for AI family ${aiFamily} (${aiFamilyUuid}) and user ${userId} (${userUuid})`,
    )

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
    console.log("Successfully stored memory in database")
    return true
  } catch (dbError) {
    console.error("Error storing in database:", dbError)

    // Last resort: try localStorage again if database fails
    try {
      if (typeof window !== "undefined") {
        const key = `memory_${userId}_${aiFamily}`
        const existingMemories = safelyGetFromLocalStorage(key) || []
        existingMemories.push({
          id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          memory,
          created_at: new Date().toISOString(),
          type: "custom",
        })

        const stored = safelyStoreInLocalStorage(key, existingMemories)
        if (stored) {
          console.log("Successfully stored memory in localStorage after database failure")
          return true
        }
      }
    } catch (localStorageError) {
      console.error("Failed to store in localStorage after database failure:", localStorageError)
    }

    return false
  }
}

// Function to retrieve memories from Mem0 API
export async function getMemoriesFromMem0(userId: string, aiFamily: string, limit = 10): Promise<any[]> {
  // If we're in a server context, skip API calls and go straight to fallback
  if (typeof window === "undefined") {
    console.log("Server context detected, using fallback retrieval mechanism")
    return fallbackToDatabase(userId, aiFamily, limit)
  }

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
    let customApiKey = "",
      customApiUrl = ""

    try {
      const savedSettings = safelyGetFromLocalStorage("mem0Settings")
      if (savedSettings) {
        customApiKey = savedSettings.apiKey || ""
        customApiUrl = savedSettings.apiUrl || ""
      }
    } catch (localStorageError) {
      console.error("Error accessing localStorage:", localStorageError)
    }

    // If custom settings are available, use them
    if (customApiKey && customApiUrl) {
      try {
        console.log(`Attempting to get memories using custom API at ${customApiUrl}`)

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
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(10000),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.memories && data.memories.length > 0) {
            console.log(`Successfully retrieved ${data.memories.length} memories using custom API`)
            return data.memories
          } else {
            console.warn("API returned success but no memories or success: false", data)
          }
        } else {
          console.warn(`API returned status ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        console.error("Error calling server API with custom credentials:", error)
      }
    }

    // Try with server-side credentials
    try {
      console.log("Attempting to get memories using server-side API")

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
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.memories && data.memories.length > 0) {
          console.log(`Successfully retrieved ${data.memories.length} memories using server-side API`)
          return data.memories
        } else {
          console.warn("Server API returned success but no memories or success: false", data)
        }
      } else {
        console.warn(`Server API returned status ${response.status}: ${response.statusText}`)
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
    console.log("Database not configured, trying localStorage fallback")
    // Try to retrieve from localStorage as a last resort
    try {
      if (typeof window !== "undefined") {
        const key = `memory_${userId}_${aiFamily}`
        const memories = safelyGetFromLocalStorage(key) || []
        console.log(`Retrieved ${memories.length} memories from localStorage`)
        return memories.slice(0, limit)
      } else {
        console.log("Window not defined, cannot use localStorage")
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

    console.log(
      `Retrieving memories from database for AI family ${aiFamily} (${aiFamilyUuid}) and user ${userId} (${userUuid})`,
    )

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

    console.log(`Successfully retrieved ${data?.length || 0} memories from database`)
    return data || []
  } catch (dbError) {
    console.error("Error retrieving from database:", dbError)

    // Last resort: try localStorage if database fails
    try {
      if (typeof window !== "undefined") {
        const key = `memory_${userId}_${aiFamily}`
        const memories = safelyGetFromLocalStorage(key) || []
        console.log(`Retrieved ${memories.length} memories from localStorage after database failure`)
        return memories.slice(0, limit)
      }
    } catch (localStorageError) {
      console.error("Failed to retrieve from localStorage after database failure:", localStorageError)
    }

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
  // If we're in a server context, skip API calls and go straight to fallback
  if (typeof window === "undefined") {
    console.log("Server context detected, using fallback search mechanism")
    return fallbackToSearchDatabase(userId, aiFamily, query, limit)
  }

  // If we've already determined the API isn't working, skip the API call entirely
  if (!isMem0ApiWorking) {
    console.log("Skipping Mem0 API call - API previously failed")
    return fallbackToSearchDatabase(userId, aiFamily, query, limit)
  }

  try {
    // Get custom API settings from localStorage if available
    let customApiKey = "",
      customApiUrl = ""

    try {
      const savedSettings = safelyGetFromLocalStorage("mem0Settings")
      if (savedSettings) {
        customApiKey = savedSettings.apiKey || ""
        customApiUrl = savedSettings.apiUrl || ""
      }
    } catch (localStorageError) {
      console.error("Error accessing localStorage:", localStorageError)
    }

    // If custom settings are available, use them
    if (customApiKey && customApiUrl) {
      try {
        console.log(`Attempting to search memories using custom API at ${customApiUrl}`)

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
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(10000),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.memories) {
            console.log(`Successfully searched and found ${data.memories.length} memories using custom API`)
            return data.memories
          } else {
            console.warn("API returned success but no memories or success: false", data)
          }
        } else {
          console.warn(`API returned status ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        console.error("Error calling server API with custom credentials:", error)
      }
    }

    // Try with server-side credentials
    try {
      console.log("Attempting to search memories using server-side API")

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
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.memories) {
          console.log(`Successfully searched and found ${data.memories.length} memories using server-side API`)
          return data.memories
        } else {
          console.warn("Server API returned success but no memories or success: false", data)
        }
      } else {
        console.warn(`Server API returned status ${response.status}: ${response.statusText}`)
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
    console.log("Database not configured, trying localStorage fallback")
    // Try to search in localStorage as a last resort
    try {
      if (typeof window !== "undefined") {
        const key = `memory_${userId}_${aiFamily}`
        const memories = safelyGetFromLocalStorage(key) || []
        const filtered = memories.filter(
          (memory: any) => memory.memory && memory.memory.toLowerCase().includes(query.toLowerCase()),
        )
        console.log(`Found ${filtered.length} matching memories in localStorage`)
        return filtered.slice(0, limit)
      } else {
        console.log("Window not defined, cannot use localStorage")
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

    console.log(
      `Searching memories in database for AI family ${aiFamily} (${aiFamilyUuid}) and user ${userId} (${userUuid})`,
    )

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

    console.log(`Successfully found ${data?.length || 0} matching memories in database`)
    return data || []
  } catch (dbError) {
    console.error("Error searching from database:", dbError)

    // Last resort: try localStorage if database fails
    try {
      if (typeof window !== "undefined") {
        const key = `memory_${userId}_${aiFamily}`
        const memories = safelyGetFromLocalStorage(key) || []
        const filtered = memories.filter(
          (memory: any) => memory.memory && memory.memory.toLowerCase().includes(query.toLowerCase()),
        )
        console.log(`Found ${filtered.length} matching memories in localStorage after database failure`)
        return filtered.slice(0, limit)
      }
    } catch (localStorageError) {
      console.error("Failed to search in localStorage after database failure:", localStorageError)
    }

    return []
  }
}

// Function to check Mem0 API connection with better diagnostics
export async function checkMem0ApiConnection(
  customApiKey?: string,
  customApiUrl?: string,
): Promise<"connected" | "disconnected"> {
  // If we're in a server context, return disconnected
  if (typeof window === "undefined") {
    console.log("Server context detected, cannot check API connection")
    return "disconnected"
  }

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
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(baseUrl, {
        method: "HEAD",
        headers: {
          Authorization: `Bearer ${customApiKey}`,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log(`Direct connection to ${baseUrl}: ${response.status} ${response.statusText}`)

      // Even a 401 or 403 would indicate the API exists
      if (response.ok || response.status === 401 || response.status === 403) {
        console.log("Mem0 API exists at the provided URL")
        return "connected"
      }
    } catch (error) {
      console.error(`Direct connection to ${baseUrl} failed:`, error)
    }

    // If all attempts failed
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
  try {
    const memory = `User ${operation} file "${fileName}" at path "${filePath}"${details ? `. ${details}` : ""}`
    return storeMemoryWithMem0(userId, "file_manager", memory)
  } catch (error) {
    console.error("Error tracking file operation:", error)
    return false
  }
}

// Function to track user preferences in Mem0
export async function trackUserPreference(userId: string, preference: string, value: string): Promise<boolean> {
  try {
    const memory = `User preference: ${preference} set to ${value}`
    return storeMemoryWithMem0(userId, "file_manager", memory)
  } catch (error) {
    console.error("Error tracking user preference:", error)
    return false
  }
}

// Function to track search queries in Mem0
export async function trackSearchQuery(userId: string, query: string): Promise<boolean> {
  try {
    const memory = `User searched for "${query}"`
    return storeMemoryWithMem0(userId, "file_manager", memory)
  } catch (error) {
    console.error("Error tracking search query:", error)
    return false
  }
}
