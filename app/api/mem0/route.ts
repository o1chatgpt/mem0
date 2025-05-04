import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Get API credentials from server-side environment variables
const getApiCredentials = () => {
  return {
    apiKey: process.env.MEM0_API_KEY || "",
    apiUrl: process.env.MEM0_API_URL || "",
  }
}

// Initialize Supabase client for fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey)
    console.log("Server: Supabase client initialized successfully")
  } catch (error) {
    console.error("Server: Failed to initialize Supabase client:", error)
  }
}

// Define a mapping of string identifiers to valid UUIDs for database compatibility
const AI_FAMILY_UUID_MAP: Record<string, string> = {
  file_manager: "00000000-0000-0000-0000-000000000001",
  lyra: "00000000-0000-0000-0000-000000000002",
  sophia: "00000000-0000-0000-0000-000000000003",
  kara: "00000000-0000-0000-0000-000000000004",
  stan: "00000000-0000-0000-0000-000000000005",
  dan: "00000000-0000-0000-0000-000000000006",
  mem0: "00000000-0000-0000-0000-000000000007",
}

const USER_UUID_MAP: Record<string, string> = {
  default_user: "00000000-0000-0000-0000-000000000010",
}

// Helper functions to get UUIDs
function getAiFamilyUuid(aiFamily: string): string {
  return AI_FAMILY_UUID_MAP[aiFamily] || "00000000-0000-0000-0000-000000000000"
}

function getUserUuid(userId: string): string {
  return USER_UUID_MAP[userId] || "00000000-0000-0000-0000-000000000000"
}

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json()
    const { operation, userId, aiFamily, memory, query, limit, customApiKey, customApiUrl } = requestData

    console.log(`Mem0 API route called with operation: ${operation}`)

    // Get credentials from server environment or from request
    const apiKey = customApiKey || process.env.MEM0_API_KEY || ""
    const apiUrl = customApiUrl || process.env.MEM0_API_URL || ""

    // Check if credentials are available
    if (!apiKey || !apiUrl) {
      console.error("API credentials not configured")

      // For get and search operations, try database fallback even if API credentials are missing
      if (operation === "get" || operation === "search") {
        const memories = await databaseFallback(operation, userId, aiFamily, query, limit)
        return NextResponse.json({
          success: true,
          memories,
          source: "database_fallback",
          message: "API credentials not configured, using database fallback",
        })
      }

      return NextResponse.json({ success: false, error: "API credentials not configured on server" }, { status: 400 })
    }

    // Handle different operations
    switch (operation) {
      case "store": {
        console.log(`Storing memory for user ${userId} and AI family ${aiFamily}`)
        try {
          const success = await storeMemory(apiKey, apiUrl, userId, aiFamily, memory)

          // If API store fails, try database fallback
          if (!success && supabase) {
            console.log("API store failed, trying database fallback")
            const dbSuccess = await storeMemoryInDatabase(userId, aiFamily, memory)
            return NextResponse.json({
              success: dbSuccess,
              source: "database_fallback",
              message: "API store failed, used database fallback",
            })
          }

          return NextResponse.json({ success })
        } catch (error) {
          console.error("Error in store operation:", error)

          // Try database fallback on error
          if (supabase) {
            console.log("API store error, trying database fallback")
            const dbSuccess = await storeMemoryInDatabase(userId, aiFamily, memory)
            return NextResponse.json({
              success: dbSuccess,
              source: "database_fallback",
              message: "API store error, used database fallback",
            })
          }

          return NextResponse.json(
            {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error in store operation",
            },
            { status: 500 },
          )
        }
      }
      case "get": {
        console.log(`Getting memories for user ${userId} and AI family ${aiFamily}`)
        try {
          const memories = await getMemories(apiKey, apiUrl, userId, aiFamily, limit)

          // If API returns no memories, try database fallback
          if ((!memories || memories.length === 0) && supabase) {
            console.log("API returned no memories, trying database fallback")
            const dbMemories = await getMemoriesFromDatabase(userId, aiFamily, limit)
            return NextResponse.json({
              success: true,
              memories: dbMemories,
              source: "database_fallback",
              message: "API returned no memories, used database fallback",
            })
          }

          return NextResponse.json({ success: true, memories })
        } catch (error) {
          console.error("Error in get operation:", error)

          // Try database fallback on error
          if (supabase) {
            console.log("API get error, trying database fallback")
            const dbMemories = await getMemoriesFromDatabase(userId, aiFamily, limit)
            return NextResponse.json({
              success: true,
              memories: dbMemories,
              source: "database_fallback",
              message: "API get error, used database fallback",
            })
          }

          return NextResponse.json(
            {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error in get operation",
              memories: [],
            },
            { status: 500 },
          )
        }
      }
      case "search": {
        console.log(`Searching memories for user ${userId} and AI family ${aiFamily} with query: ${query}`)
        try {
          const memories = await searchMemories(apiKey, apiUrl, userId, aiFamily, query, limit)

          // If API returns no memories, try database fallback
          if ((!memories || memories.length === 0) && supabase) {
            console.log("API search returned no memories, trying database fallback")
            const dbMemories = await searchMemoriesInDatabase(userId, aiFamily, query, limit)
            return NextResponse.json({
              success: true,
              memories: dbMemories,
              source: "database_fallback",
              message: "API search returned no memories, used database fallback",
            })
          }

          return NextResponse.json({ success: true, memories })
        } catch (error) {
          console.error("Error in search operation:", error)

          // Try database fallback on error
          if (supabase) {
            console.log("API search error, trying database fallback")
            const dbMemories = await searchMemoriesInDatabase(userId, aiFamily, query, limit)
            return NextResponse.json({
              success: true,
              memories: dbMemories,
              source: "database_fallback",
              message: "API search error, used database fallback",
            })
          }

          return NextResponse.json(
            {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error in search operation",
              memories: [],
            },
            { status: 500 },
          )
        }
      }
      case "check": {
        console.log(`Checking connection to Mem0 API at ${apiUrl}`)
        try {
          const status = await checkConnection(apiKey, apiUrl)
          console.log(`Connection status: ${status}`)
          return NextResponse.json({ success: true, status })
        } catch (error) {
          console.error("Error in check operation:", error)
          return NextResponse.json(
            {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error in check operation",
              status: "disconnected",
            },
            { status: 500 },
          )
        }
      }
      default:
        console.error(`Invalid operation: ${operation}`)
        return NextResponse.json({ success: false, error: "Invalid operation" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in Mem0 API route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// Helper function for database fallback operations
async function databaseFallback(operation: string, userId: string, aiFamily: string, query?: string, limit = 10) {
  if (!supabase) {
    console.error("Database fallback not available: Supabase client not initialized")
    return []
  }

  switch (operation) {
    case "get":
      return getMemoriesFromDatabase(userId, aiFamily, limit)
    case "search":
      return searchMemoriesInDatabase(userId, aiFamily, query || "", limit)
    default:
      console.error(`Unsupported database fallback operation: ${operation}`)
      return []
  }
}

// Database fallback functions
async function storeMemoryInDatabase(userId: string, aiFamily: string, memory: string): Promise<boolean> {
  if (!supabase) return false

  try {
    const aiFamilyUuid = getAiFamilyUuid(aiFamily)
    const userUuid = getUserUuid(userId)

    console.log(
      `Storing memory in database for AI family ${aiFamily} (${aiFamilyUuid}) and user ${userId} (${userUuid})`,
    )

    const { error } = await supabase.from("ai_family_member_memories").insert([
      {
        ai_family_member_id: aiFamilyUuid,
        user_id: userUuid,
        memory,
      },
    ])

    if (error) {
      console.error("Database insert error:", error)
      return false
    }

    console.log("Successfully stored memory in database")
    return true
  } catch (error) {
    console.error("Error storing in database:", error)
    return false
  }
}

async function getMemoriesFromDatabase(userId: string, aiFamily: string, limit: number): Promise<any[]> {
  if (!supabase) return []

  try {
    const aiFamilyUuid = getAiFamilyUuid(aiFamily)
    const userUuid = getUserUuid(userId)

    console.log(
      `Getting memories from database for AI family ${aiFamily} (${aiFamilyUuid}) and user ${userId} (${userUuid})`,
    )

    const { data, error } = await supabase
      .from("ai_family_member_memories")
      .select("*")
      .eq("ai_family_member_id", aiFamilyUuid)
      .eq("user_id", userUuid)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Database query error:", error)
      return []
    }

    console.log(`Retrieved ${data?.length || 0} memories from database`)

    // Add type field for consistency with API
    return (data || []).map((item) => ({
      ...item,
      type: determineMemoryType(item.memory),
    }))
  } catch (error) {
    console.error("Error retrieving from database:", error)
    return []
  }
}

async function searchMemoriesInDatabase(
  userId: string,
  aiFamily: string,
  query: string,
  limit: number,
): Promise<any[]> {
  if (!supabase) return []

  try {
    const aiFamilyUuid = getAiFamilyUuid(aiFamily)
    const userUuid = getUserUuid(userId)

    console.log(
      `Searching memories in database for AI family ${aiFamily} (${aiFamilyUuid}) and user ${userId} (${userUuid})`,
    )

    const { data, error } = await supabase
      .from("ai_family_member_memories")
      .select("*")
      .eq("ai_family_member_id", aiFamilyUuid)
      .eq("user_id", userUuid)
      .ilike("memory", `%${query}%`)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Database search error:", error)
      return []
    }

    console.log(`Found ${data?.length || 0} matching memories in database`)

    // Add type field for consistency with API
    return (data || []).map((item) => ({
      ...item,
      type: determineMemoryType(item.memory),
    }))
  } catch (error) {
    console.error("Error searching from database:", error)
    return []
  }
}

// Helper function to determine memory type
function determineMemoryType(memory: string): string {
  const lowerMemory = memory.toLowerCase()
  if (lowerMemory.includes("file")) return "file_operation"
  if (lowerMemory.includes("search")) return "search"
  if (lowerMemory.includes("preference")) return "preference"
  return "custom"
}

// Helper functions for Mem0 API operations
async function storeMemory(apiKey: string, apiUrl: string, userId: string, aiFamily: string, memory: string) {
  try {
    // Format the base URL correctly
    const baseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl

    // Try both endpoint structures to be safe
    const endpoints = [`${baseUrl}/api/memory/add`, `${baseUrl}/memories`]

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying to store memory at endpoint: ${endpoint}`)
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            user_id: userId,
            text: memory,
            memory: memory,
            metadata: {
              ai_family_member_id: aiFamily,
              source: "file_manager",
            },
          }),
          signal: AbortSignal.timeout(5000),
        })

        console.log(`Response from ${endpoint}: ${response.status} ${response.statusText}`)

        if (response.ok) {
          console.log("Successfully stored memory")
          return true
        }

        // Log response body for debugging
        try {
          const responseText = await response.text()
          console.log(`Response body from ${endpoint}:`, responseText)
        } catch (bodyError) {
          console.error(`Could not read response body from ${endpoint}:`, bodyError)
        }
      } catch (error) {
        console.error(`Error with endpoint ${endpoint}:`, error)
      }
    }

    console.error("All endpoints failed for storing memory")
    return false
  } catch (error) {
    console.error("Error storing memory:", error)
    return false
  }
}

async function getMemories(apiKey: string, apiUrl: string, userId: string, aiFamily: string, limit = 10) {
  try {
    // Format the base URL correctly
    const baseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl

    // Try multiple endpoint structures with different methods
    const endpointConfigs = [
      { url: `${baseUrl}/api/memory/search`, method: "POST" },
      { url: `${baseUrl}/memories`, method: "GET" },
      { url: `${baseUrl}/memories`, method: "POST" },
      { url: `${baseUrl}/api/memories`, method: "GET" },
      { url: `${baseUrl}/api/memories`, method: "POST" },
      { url: `${baseUrl}/api/memory/list`, method: "POST" },
      { url: `${baseUrl}/api/memory/list`, method: "GET" },
    ]

    for (const config of endpointConfigs) {
      try {
        console.log(`Trying to get memories from endpoint: ${config.url} with method: ${config.method}`)

        let response

        if (config.method === "GET") {
          // For GET requests
          const queryParams = new URLSearchParams({
            user_id: userId,
            limit: limit.toString(),
          }).toString()

          response = await fetch(`${config.url}?${queryParams}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            signal: AbortSignal.timeout(5000),
          })
        } else {
          // For POST requests
          response = await fetch(config.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              user_id: userId,
              query: "", // Empty query to get all memories
              limit: limit,
              filter: aiFamily
                ? {
                    metadata: {
                      ai_family_member_id: aiFamily,
                    },
                  }
                : undefined,
            }),
            signal: AbortSignal.timeout(5000),
          })
        }

        console.log(`${config.method} response from ${config.url}: ${response.status} ${response.statusText}`)

        if (response.ok) {
          const data = await response.json()
          console.log(`Successfully retrieved memories from ${config.url}`)

          // Handle different response formats
          let memories = []
          if (Array.isArray(data)) {
            memories = data
          } else if (data.results) {
            memories = data.results
          } else if (data.memories) {
            memories = data.memories
          } else if (data.data) {
            memories = data.data
          }

          // Add type field if missing
          memories = memories.map((memory: any) => ({
            ...memory,
            type: memory.type || determineMemoryType(memory.memory || memory.text || ""),
          }))

          return memories
        }

        // Log response body for debugging
        try {
          const responseText = await response.text()
          console.log(`Response body from ${config.url}:`, responseText)
        } catch (bodyError) {
          console.error(`Could not read response body from ${config.url}:`, bodyError)
        }
      } catch (error) {
        console.error(`Error with endpoint ${config.url}:`, error)
      }
    }

    console.error("All endpoints failed for getting memories")
    return []
  } catch (error) {
    console.error("Error retrieving memories:", error)
    return []
  }
}

async function searchMemories(
  apiKey: string,
  apiUrl: string,
  userId: string,
  aiFamily: string,
  query: string,
  limit = 10,
) {
  try {
    // Format the base URL correctly
    const baseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl

    // Try multiple endpoint structures
    const endpoints = [
      `${baseUrl}/api/memory/search`,
      `${baseUrl}/search`,
      `${baseUrl}/api/search`,
      `${baseUrl}/memories/search`,
      `${baseUrl}/api/memories/search`,
    ]

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying to search memories at endpoint: ${endpoint}`)
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            user_id: userId,
            query: query,
            limit: limit,
            filter: aiFamily
              ? {
                  metadata: {
                    ai_family_member_id: aiFamily,
                  },
                }
              : undefined,
          }),
          signal: AbortSignal.timeout(5000),
        })

        console.log(`Response from ${endpoint}: ${response.status} ${response.statusText}`)

        if (response.ok) {
          const data = await response.json()
          console.log(`Successfully searched memories from ${endpoint}`)

          // Handle different response formats
          let memories = []
          if (Array.isArray(data)) {
            memories = data
          } else if (data.results) {
            memories = data.results
          } else if (data.memories) {
            memories = data.memories
          } else if (data.data) {
            memories = data.data
          }

          // Add type field if missing
          memories = memories.map((memory: any) => ({
            ...memory,
            type: memory.type || determineMemoryType(memory.memory || memory.text || ""),
          }))

          return memories
        }

        // Log response body for debugging
        try {
          const responseText = await response.text()
          console.log(`Response body from ${endpoint}:`, responseText)
        } catch (bodyError) {
          console.error(`Could not read response body from ${endpoint}:`, bodyError)
        }
      } catch (error) {
        console.error(`Error with endpoint ${endpoint}:`, error)
      }
    }

    console.error("All endpoints failed for searching memories")
    return []
  } catch (error) {
    console.error("Error searching memories:", error)
    return []
  }
}

async function checkConnection(apiKey: string, apiUrl: string) {
  try {
    // Format the base URL correctly
    const baseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl

    console.log(`Server: Checking Mem0 connection to ${baseUrl} with key ${apiKey.substring(0, 4)}...`)

    // Try direct connection first (most reliable)
    try {
      // Try a simple HEAD request to the base URL
      const response = await fetch(baseUrl, {
        method: "HEAD",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      })

      console.log(`Server: Direct connection to ${baseUrl}: ${response.status} ${response.statusText}`)

      // Even a 401 or 403 would indicate the API exists
      if (response.ok || response.status === 401 || response.status === 403) {
        console.log("Server: Mem0 API exists at the provided URL")
        return "connected"
      }
    } catch (error) {
      console.error(`Server: Direct connection to ${baseUrl} failed:`, error)
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
        console.log(`Server: Trying endpoint: ${endpoint}`)
        const response = await fetch(endpoint, {
          method: endpoint.includes("memories") || endpoint.includes("search") ? "HEAD" : "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          signal: AbortSignal.timeout(3000),
        })

        console.log(`Server: Response from ${endpoint}: ${response.status} ${response.statusText}`)

        // For the memories endpoint, even a 401 or 403 would indicate the API exists
        if (
          response.ok ||
          ((endpoint.includes("memories") || endpoint.includes("search")) &&
            (response.status === 401 || response.status === 403))
        ) {
          console.log(`Server: Mem0 API connection successful via ${endpoint}`)
          return "connected"
        }
      } catch (error) {
        console.error(`Server: Connection test failed for endpoint ${endpoint}:`, error)
      }
    }

    console.log("Server: All connection attempts failed, marking as disconnected")
    return "disconnected"
  } catch (error) {
    console.error("Server: Error checking connection:", error)
    return "disconnected"
  }
}
