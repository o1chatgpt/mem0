import { type NextRequest, NextResponse } from "next/server"

// Get environment variables on the server side
// Changed from NEXT_PUBLIC_MEM0_API_KEY to MEM0_API_KEY (server-side only)
const MEM0_API_KEY = process.env.MEM0_API_KEY || ""
const MEM0_API_URL = process.env.NEXT_PUBLIC_MEM0_API_URL || ""

// Helper function to safely parse JSON
async function safeParseResponse(response: Response) {
  const contentType = response.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    try {
      return await response.json()
    } catch (error) {
      console.error("Failed to parse JSON response:", error)
      return { error: "Invalid JSON response from API" }
    }
  } else {
    // For non-JSON responses, return a structured error with the text
    const text = await response.text()
    console.error("Non-JSON response received:", text.substring(0, 200) + "...")
    return {
      error: "Non-JSON response from API",
      statusCode: response.status,
      contentType,
      preview: text.substring(0, 100) + "...",
    }
  }
}

export async function GET(request: NextRequest) {
  // Extract the endpoint from the query parameters
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")

  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint parameter" }, { status: 400 })
  }

  try {
    // Construct the full URL
    const url = `${MEM0_API_URL}${endpoint}`
    console.log(`Proxying GET request to: ${url}`)

    // Make the request to the Mem0 API with the server-side API key
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${MEM0_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      // Pass through the cache directive
      cache: "no-store",
    })

    // Check if the response is OK
    if (!response.ok) {
      console.error(`API returned error status: ${response.status}`)
      // Return a structured error response
      return NextResponse.json(
        {
          error: `API returned status ${response.status}`,
          endpoint,
          statusCode: response.status,
        },
        { status: response.status },
      )
    }

    // Safely parse the response
    const data = await safeParseResponse(response)

    // If we got an error object from safeParseResponse, it means parsing failed
    if (data.error && !data.memories && !data.memory && !data.stats) {
      return NextResponse.json(data, { status: 500 })
    }

    // Return the data
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error proxying to Mem0 API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch from Mem0 API",
        message: error instanceof Error ? error.message : String(error),
        endpoint,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  // Extract the endpoint from the query parameters
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")

  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint parameter" }, { status: 400 })
  }

  try {
    // Get the request body
    const body = await request.json()

    // Construct the full URL
    const url = `${MEM0_API_URL}${endpoint}`
    console.log(`Proxying POST request to: ${url}`)

    // Make the request to the Mem0 API with the server-side API key
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MEM0_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    // Check if the response is OK
    if (!response.ok) {
      console.error(`API returned error status: ${response.status}`)
      // Return a structured error response
      return NextResponse.json(
        {
          error: `API returned status ${response.status}`,
          endpoint,
          statusCode: response.status,
        },
        { status: response.status },
      )
    }

    // Safely parse the response
    const data = await safeParseResponse(response)

    // If we got an error object from safeParseResponse, it means parsing failed
    if (data.error && !data.memories && !data.memory && !data.stats) {
      return NextResponse.json(data, { status: 500 })
    }

    // Return the data
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error proxying to Mem0 API:", error)
    return NextResponse.json(
      {
        error: "Failed to post to Mem0 API",
        message: error instanceof Error ? error.message : String(error),
        endpoint,
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  // Extract the endpoint from the query parameters
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")

  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint parameter" }, { status: 400 })
  }

  try {
    // Get the request body
    const body = await request.json()

    // Construct the full URL
    const url = `${MEM0_API_URL}${endpoint}`
    console.log(`Proxying PATCH request to: ${url}`)

    // Make the request to the Mem0 API with the server-side API key
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${MEM0_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    // Check if the response is OK
    if (!response.ok) {
      console.error(`API returned error status: ${response.status}`)
      // Return a structured error response
      return NextResponse.json(
        {
          error: `API returned status ${response.status}`,
          endpoint,
          statusCode: response.status,
        },
        { status: response.status },
      )
    }

    // Safely parse the response
    const data = await safeParseResponse(response)

    // If we got an error object from safeParseResponse, it means parsing failed
    if (data.error && !data.memories && !data.memory && !data.stats) {
      return NextResponse.json(data, { status: 500 })
    }

    // Return the data
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error proxying to Mem0 API:", error)
    return NextResponse.json(
      {
        error: "Failed to patch to Mem0 API",
        message: error instanceof Error ? error.message : String(error),
        endpoint,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  // Extract the endpoint from the query parameters
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")

  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint parameter" }, { status: 400 })
  }

  try {
    // Construct the full URL
    const url = `${MEM0_API_URL}${endpoint}`
    console.log(`Proxying DELETE request to: ${url}`)

    // Make the request to the Mem0 API with the server-side API key
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${MEM0_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    // Check if the response is OK
    if (!response.ok) {
      console.error(`API returned error status: ${response.status}`)
      // Return a structured error response
      return NextResponse.json(
        {
          error: `API returned status ${response.status}`,
          endpoint,
          statusCode: response.status,
        },
        { status: response.status },
      )
    }

    // Safely parse the response
    const data = await safeParseResponse(response)

    // If we got an error object from safeParseResponse, it means parsing failed
    if (data.error && !data.memories && !data.memory && !data.stats) {
      return NextResponse.json(data, { status: 500 })
    }

    // Return the data
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error proxying to Mem0 API:", error)
    return NextResponse.json(
      {
        error: "Failed to delete from Mem0 API",
        message: error instanceof Error ? error.message : String(error),
        endpoint,
      },
      { status: 500 },
    )
  }
}
