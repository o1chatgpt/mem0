import { type NextRequest, NextResponse } from "next/server"

// Get API credentials from server-side environment variables
const getApiCredentials = () => {
  return {
    apiKey: process.env.MEM0_API_KEY || "",
    apiUrl: process.env.MEM0_API_URL || "",
  }
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
      return NextResponse.json({ success: false, error: "API credentials not configured on server" }, { status: 400 })
    }

    // Handle different operations
    switch (operation) {
      case "store": {
        console.log(`Storing memory for user ${userId} and AI family ${aiFamily}`)
        const success = await storeMemory(apiKey, apiUrl, userId, aiFamily, memory)
        return NextResponse.json({ success })
      }
      case "get": {
        console.log(`Getting memories for user ${userId} and AI family ${aiFamily}`)
        const memories = await getMemories(apiKey, apiUrl, userId, aiFamily, limit)
        return NextResponse.json({ success: true, memories })
      }
      case "search": {
        console.log(`Searching memories for user ${userId} and AI family ${aiFamily} with query: ${query}`)
        const memories = await searchMemories(apiKey, apiUrl, userId, aiFamily, query, limit)
        return NextResponse.json({ success: true, memories })
      }
      case "check": {
        console.log(`Checking connection to Mem0 API at ${apiUrl}`)
        const status = await checkConnection(apiKey, apiUrl)
        console.log(`Connection status: ${status}`)
        return NextResponse.json({ success: true, status })
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

// Helper functions for Mem0 API operations
async function storeMemory(apiKey: string, apiUrl: string, userId: string, aiFamily: string, memory: string) {
  try {
    // Format the base URL correctly
    const baseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl

    // Try both endpoint structures to be safe
    const endpoints = [`${baseUrl}/api/memory/add`, `${baseUrl}/memories`]

    for (const endpoint of endpoints) {
      try {
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

        if (response.ok) {
          return true
        }
      } catch (error) {
        console.error(`Error with endpoint ${endpoint}:`, error)
      }
    }

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

    // Try both endpoint structures to be safe
    const endpoints = [`${baseUrl}/api/memory/search`, `${baseUrl}/memories`]

    for (const endpoint of endpoints) {
      try {
        // Use a simple GET request for the /memories endpoint as a fallback
        const isMemoriesEndpoint = endpoint.endsWith("/memories")

        if (isMemoriesEndpoint) {
          // Try a simple GET request first
          const response = await fetch(endpoint, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            signal: AbortSignal.timeout(5000),
          })

          if (response.ok) {
            const data = await response.json()
            return Array.isArray(data) ? data : data.memories || data.results || []
          }
        }

        // If GET didn't work or it's not the memories endpoint, try POST
        const response = await fetch(endpoint, {
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

        if (response.ok) {
          const data = await response.json()
          return data.results || data.memories || (Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error(`Error with endpoint ${endpoint}:`, error)
      }
    }

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

    // Try both endpoint structures to be safe
    const endpoints = [`${baseUrl}/api/memory/search`, `${baseUrl}/search`]

    for (const endpoint of endpoints) {
      try {
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

        if (response.ok) {
          const data = await response.json()
          return data.results || data.memories || (Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error(`Error with endpoint ${endpoint}:`, error)
      }
    }

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
