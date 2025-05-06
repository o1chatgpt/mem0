import { NextResponse } from "next/server"

// Get environment variables on the server side
// Changed from NEXT_PUBLIC_MEM0_API_KEY to MEM0_API_KEY (server-side only)
const MEM0_API_KEY = process.env.MEM0_API_KEY || ""
const MEM0_API_URL = process.env.NEXT_PUBLIC_MEM0_API_URL || ""

export async function GET() {
  if (!MEM0_API_URL || !MEM0_API_KEY) {
    return NextResponse.json({
      available: false,
      reason: "API credentials not configured",
    })
  }

  try {
    // Try to make a simple request to check if the API is available
    const response = await fetch(`${MEM0_API_URL}/health`, {
      headers: {
        Authorization: `Bearer ${MEM0_API_KEY}`,
        Accept: "application/json",
      },
      // Short timeout
      signal: AbortSignal.timeout(3000),
    })

    if (response.ok) {
      return NextResponse.json({ available: true })
    }

    // If health endpoint doesn't exist, try stats as a fallback
    const statsResponse = await fetch(`${MEM0_API_URL}/stats`, {
      headers: {
        Authorization: `Bearer ${MEM0_API_KEY}`,
        Accept: "application/json",
      },
      // Short timeout
      signal: AbortSignal.timeout(3000),
    })

    if (statsResponse.ok) {
      return NextResponse.json({ available: true })
    }

    // If both failed but returned a response, the API might be available but endpoints are different
    return NextResponse.json({
      available: false,
      reason: `API returned status ${response.status} and ${statsResponse.status}`,
    })
  } catch (error) {
    return NextResponse.json({
      available: false,
      reason: error instanceof Error ? error.message : String(error),
    })
  }
}
