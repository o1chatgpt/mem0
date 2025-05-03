import { type NextRequest, NextResponse } from "next/server"
import { config } from "@/lib/config"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")

  if (!endpoint) {
    return NextResponse.json({ error: "No endpoint specified" }, { status: 400 })
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${config.serverApiKey}`,
      },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("API proxy error:", error)
    return NextResponse.json({ error: "Failed to fetch from server" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")

  if (!endpoint) {
    return NextResponse.json({ error: "No endpoint specified" }, { status: 400 })
  }

  try {
    const body = await request.json()

    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.serverApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("API proxy error:", error)
    return NextResponse.json({ error: "Failed to post to server" }, { status: 500 })
  }
}
