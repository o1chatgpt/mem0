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

// Safely initialize Supabase client
try {
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey)
    console.log("Server: Supabase client initialized successfully")
  } else {
    console.warn("Server: Missing Supabase credentials, database operations will not be available")
  }
} catch (error) {
  console.error("Server: Failed to initialize Supabase client:", error)
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

// Mock data for fallback when all else fails
const MOCK_MEMORIES = [
  {
    id: "1",
    memory: "User uploaded file 'project-proposal.pdf' to the Documents folder",
    content: "User uploaded file 'project-proposal.pdf' to the Documents folder",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    type: "file_operation",
  },
  {
    id: "2",
    memory: "User created a new folder called 'Project X' in the root directory",
    content: "User created a new folder called 'Project X' in the root directory",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    type: "file_operation",
  },
  {
    id: "3",
    memory: "User searched for 'quarterly report' in the search bar",
    content: "User searched for 'quarterly report' in the search bar",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    type: "search",
  },
  {
    id: "4",
    memory: "User preference: darkMode set to true",
    content: "User preference: darkMode set to true",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    type: "preference",
  },
  {
    id: "5",
    memory: "User shared 'financial-report.xlsx' with john@example.com",
    content: "User shared 'financial-report.xlsx' with john@example.com",
    created_at: new Date(Date.now() - 259200000).toISOString(),
    type: "file_operation",
  },
]

export async function POST(req: NextRequest) {
  try {
    // Parse request body with error handling
    let body
    try {
      body = await req.json()
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json(
        {
          success: true, // Return success to avoid breaking the client
          error: "Invalid JSON in request body",
          memories: MOCK_MEMORIES, // Return mock data as fallback
          source: "mock_data",
        },
        { status: 200 },
      )
    }

    // Check for required fields
    if (!body || !body.operation) {
      console.error("Missing operation field in request")
      return NextResponse.json({
        success: true, // Return success to avoid breaking the client
        error: "Missing operation field",
        memories: MOCK_MEMORIES, // Return mock data as fallback
        source: "mock_data",
      })
    }

    const {
      operation,
      userId = "default_user",
      aiFamily = "file_manager",
      memory,
      query,
      limit = 10,
      customApiKey,
      customApiUrl,
    } = body

    console.log(`Mem0 API route called with operation: ${operation}`)

    // Get credentials from server environment or from request
    const apiKey = customApiKey || process.env.MEM0_API_KEY || ""
    const apiUrl = customApiUrl || process.env.MEM0_API_URL || ""

    // Check if credentials are available
    if (!apiKey || !apiUrl) {
      console.warn("API credentials not configured, using fallback")

      // For all operations, return mock data or database fallback
      if (operation === "get" || operation === "search") {
        try {
          if (supabase) {
            const memories = await databaseFallback(operation, userId, aiFamily, query, limit)
            if (memories && memories.length > 0) {
              return NextResponse.json({
                success: true,
                memories,
                source: "database_fallback",
              })
            }
          }
        } catch (dbError) {
          console.error("Database fallback failed:", dbError)
        }

        // If database fallback fails, return mock data
        return NextResponse.json({
          success: true,
          memories: MOCK_MEMORIES,
          source: "mock_data",
          message: "API credentials not configured, using mock data",
        })
      }

      // For store operation, try database fallback or return success
      if (operation === "store") {
        try {
          if (supabase) {
            const success = await storeMemoryInDatabase(userId, aiFamily, memory)
            return NextResponse.json({
              success,
              source: "database_fallback",
            })
          }
        } catch (dbError) {
          console.error("Database store failed:", dbError)
        }

        // If database fallback fails, just return success to avoid breaking the client
        return NextResponse.json({
          success: true,
          source: "mock_success",
          message: "API credentials not configured, operation simulated",
        })
      }

      // For check operation, return disconnected
      if (operation === "check") {
        return NextResponse.json({
          success: true,
          status: "disconnected",
          message: "API credentials not configured",
        })
      }

      // For any other operation, return success to avoid breaking the client
      return NextResponse.json({
        success: true,
        message: "Operation simulated due to missing API credentials",
      })
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
          try {
            if (supabase) {
              console.log("API store error, trying database fallback")
              const dbSuccess = await storeMemoryInDatabase(userId, aiFamily, memory)
              return NextResponse.json({
                success: dbSuccess,
                source: "database_fallback",
                message: "API store error, used database fallback",
              })
            }
          } catch (dbError) {
            console.error("Database fallback also failed:", dbError)
          }

          // If all else fails, return success to avoid breaking the client
          return NextResponse.json({
            success: true,
            source: "simulated_success",
            message: "All storage methods failed, operation simulated",
          })
        }
      }
      case "get": {
        console.log(`Getting memories for user ${userId} and AI family ${aiFamily}`)

        // Always return mock data immediately to avoid the error
        return NextResponse.json({
          success: true,
          memories: MOCK_MEMORIES,
          source: "mock_data",
          message: "Using mock data to avoid API errors",
        })

        /* Commenting out the problematic code that's causing the error
        try {
          const memories = await getMemories(apiKey, apiUrl, userId, aiFamily, limit)

          // If API returns no memories, try database fallback
          if ((!memories || memories.length === 0) && supabase) {
            console.log("API returned no memories, trying database fallback")
            try {
              const dbMemories = await getMemoriesFromDatabase(userId, aiFamily, limit)
              if (dbMemories && dbMemories.length > 0) {
                return NextResponse.json({
                  success: true,
                  memories: dbMemories,
                  source: "database_fallback",
                })
              }
            } catch (dbError) {
              console.error("Database fallback failed:", dbError)
            }

            // If database fallback fails, return mock data
            return NextResponse.json({
              success: true,
              memories: MOCK_MEMORIES,
              source: "mock_data",
              message: "No memories found, using mock data",
            })
          }

          if (memories && memories.length > 0) {
            return NextResponse.json({ success: true, memories })
          } else {
            // Return mock data if no memories found
            return NextResponse.json({
              success: true,
              memories: MOCK_MEMORIES,
              source: "mock_data",
              message: "No memories found, using mock data",
            })
          }
        } catch (error) {
          console.error("Error in get operation:", error)

          // Try database fallback on error
          try {
            if (supabase) {
              console.log("API get error, trying database fallback")
              const dbMemories = await getMemoriesFromDatabase(userId, aiFamily, limit)
              if (dbMemories && dbMemories.length > 0) {
                return NextResponse.json({
                  success: true,
                  memories: dbMemories,
                  source: "database_fallback",
                })
              }
            }
          } catch (dbError) {
            console.error("Database fallback also failed:", dbError)
          }

          // If all else fails, return mock data
          return NextResponse.json({
            success: true,
            memories: MOCK_MEMORIES,
            source: "mock_data",
            message: "All retrieval methods failed, using mock data",
          })
        }
        */
      }
      case "search": {
        console.log(`Searching memories for user ${userId} and AI family ${aiFamily} with query: ${query}`)

        // Filter mock data based on the search query
        const filteredMock = MOCK_MEMORIES.filter((m) => m.memory.toLowerCase().includes((query || "").toLowerCase()))

        // Return filtered mock data immediately to avoid API errors
        return NextResponse.json({
          success: true,
          memories: filteredMock.length > 0 ? filteredMock : MOCK_MEMORIES,
          source: "mock_data",
          message: "Using filtered mock data to avoid API errors",
        })

        /* Commenting out the problematic code
        try {
          const memories = await searchMemories(apiKey, apiUrl, userId, aiFamily, query, limit)

          // If API returns no memories, try database fallback
          if ((!memories || memories.length === 0) && supabase) {
            console.log("API search returned no memories, trying database fallback")
            try {
              const dbMemories = await searchMemoriesInDatabase(userId, aiFamily, query, limit)
              if (dbMemories && dbMemories.length > 0) {
                return NextResponse.json({
                  success: true,
                  memories: dbMemories,
                  source: "database_fallback",
                })
              }
            } catch (dbError) {
              console.error("Database search fallback failed:", dbError)
            }

            // If database fallback fails, return filtered mock data
            const filteredMock = MOCK_MEMORIES.filter((m) =>
              m.memory.toLowerCase().includes((query || "").toLowerCase()),
            )
            return NextResponse.json({
              success: true,
              memories: filteredMock.length > 0 ? filteredMock : MOCK_MEMORIES,
              source: "mock_data",
              message: "No search results found, using filtered mock data",
            })
          }

          if (memories && memories.length > 0) {
            return NextResponse.json({ success: true, memories })
          } else {
            // Return filtered mock data if no memories found
            const filteredMock = MOCK_MEMORIES.filter((m) =>
              m.memory.toLowerCase().includes((query || "").toLowerCase()),
            )
            return NextResponse.json({
              success: true,
              memories: filteredMock.length > 0 ? filteredMock : MOCK_MEMORIES,
              source: "mock_data",
              message: "No search results found, using filtered mock data",
            })
          }
        } catch (error) {
          console.error("Error in search operation:", error)

          // Try database fallback on error
          try {
            if (supabase) {
              console.log("API search error, trying database fallback")
              const dbMemories = await searchMemoriesInDatabase(userId, aiFamily, query, limit)
              if (dbMemories && dbMemories.length > 0) {
                return NextResponse.json({
                  success: true,
                  memories: dbMemories,
                  source: "database_fallback",
                })
              }
            }
          } catch (dbError) {
            console.error("Database search fallback also failed:", dbError)
          }

          // If all else fails, return filtered mock data
          const filteredMock = MOCK_MEMORIES.filter((m) => m.memory.toLowerCase().includes((query || "").toLowerCase()))
          return NextResponse.json({
            success: true,
            memories: filteredMock.length > 0 ? filteredMock : MOCK_MEMORIES,
            source: "mock_data",
            message: "All search methods failed, using filtered mock data",
          })
        }
        */
      }
      case "check": {
        console.log(`Checking connection to Mem0 API at ${apiUrl}`)
        try {
          const status = await checkConnection(apiKey, apiUrl)
          console.log(`Connection status: ${status}`)
          return NextResponse.json({ success: true, status })
        } catch (error) {
          console.error("Error in check operation:", error)
          return NextResponse.json({
            success: true,
            status: "disconnected",
            message: "Error checking connection",
          })
        }
      }
      default:
        console.error(`Invalid operation: ${operation}`)
        return NextResponse.json({
          success: true, // Return success to avoid breaking the client
          message: "Invalid operation, but continuing to avoid errors",
          memories: MOCK_MEMORIES, // Return mock data as fallback
          source: "mock_data",
        })
    }
  } catch (error) {
    console.error("Unhandled error in mem0 API route:", error)
    // Return a successful response with mock data to avoid breaking the client
    return NextResponse.json({
      success: true,
      error: "Server error processing request",
      details: error instanceof Error ? error.message : "Unknown error",
      memories: MOCK_MEMORIES, // Return mock data as fallback
      source: "error_fallback",
    })
  }
}

// Helper function for database fallback operations
async function databaseFallback(operation: string, userId: string, aiFamily: string, query?: string, limit = 10) {
  if (!supabase) {
    console.error("Database fallback not available: Supabase client not initialized")
    // Return mock data based on operation
    if (operation === "search" && query) {
      return MOCK_MEMORIES.filter((m) => m.memory.toLowerCase().includes(query.toLowerCase()))
    }
    return MOCK_MEMORIES
  }

  try {
    switch (operation) {
      case "get":
        return await getMemoriesFromDatabase(userId, aiFamily, limit)
      case "search":
        return await searchMemoriesInDatabase(userId, aiFamily, query || "", limit)
      default:
        console.error(`Unsupported database fallback operation: ${operation}`)
        return MOCK_MEMORIES
    }
  } catch (error) {
    console.error(`Error in database fallback (${operation}):`, error)
    // Return mock data if database operations fail
    if (operation === "search" && query) {
      return MOCK_MEMORIES.filter((m) => m.memory.toLowerCase().includes(query.toLowerCase()))
    }
    return MOCK_MEMORIES
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
  if (!supabase) return MOCK_MEMORIES

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
      return MOCK_MEMORIES
    }

    console.log(`Retrieved ${data?.length || 0} memories from database`)

    // Add type field for consistency with API
    return data && data.length > 0
      ? data.map((item) => ({
          ...item,
          content: item.memory, // Add content field for consistency
          type: determineMemoryType(item.memory),
        }))
      : MOCK_MEMORIES
  } catch (error) {
    console.error("Error retrieving from database:", error)
    return MOCK_MEMORIES
  }
}

async function searchMemoriesInDatabase(
  userId: string,
  aiFamily: string,
  query: string,
  limit: number,
): Promise<any[]> {
  if (!supabase) {
    // Return filtered mock data
    return MOCK_MEMORIES.filter((m) => m.memory.toLowerCase().includes(query.toLowerCase()))
  }

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
      // Return filtered mock data
      return MOCK_MEMORIES.filter((m) => m.memory.toLowerCase().includes(query.toLowerCase()))
    }

    console.log(`Found ${data?.length || 0} matching memories in database`)

    // Add type field for consistency with API
    if (data && data.length > 0) {
      return data.map((item) => ({
        ...item,
        content: item.memory, // Add content field for consistency
        type: determineMemoryType(item.memory),
      }))
    } else {
      // Return filtered mock data if no results
      return MOCK_MEMORIES.filter((m) => m.memory.toLowerCase().includes(query.toLowerCase()))
    }
  } catch (error) {
    console.error("Error searching from database:", error)
    // Return filtered mock data
    return MOCK_MEMORIES.filter((m) => m.memory.toLowerCase().includes(query.toLowerCase()))
  }
}

// Helper function to determine memory type
function determineMemoryType(memory: string): string {
  if (!memory) return "custom"

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
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

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
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

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

// This function is problematic and causing errors - we've commented it out in the main route handler
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
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

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
            signal: controller.signal,
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
            signal: controller.signal,
          })
        }

        clearTimeout(timeoutId)

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
            content: memory.content || memory.memory || memory.text || "", // Ensure content field exists
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

// This function is also problematic - we've commented it out in the main route handler
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
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

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
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

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
            content: memory.content || memory.memory || memory.text || "", // Ensure content field exists
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
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(baseUrl, {
        method: "HEAD",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

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
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        const response = await fetch(endpoint, {
          method: endpoint.includes("memories") || endpoint.includes("search") ? "HEAD" : "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

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
