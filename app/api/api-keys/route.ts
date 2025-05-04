import { NextResponse } from "next/server"
import { getUserApiKeysFromDb, createApiKeyInDb } from "@/lib/db"
import { generateApiKey } from "@/lib/api-key-manager"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const apiKeys = await getUserApiKeysFromDb(userId)
    return NextResponse.json(apiKeys)
  } catch (error) {
    console.error("Error fetching API keys:", error)
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, permissions, ownerId } = await request.json()

    if (!name || !permissions || !ownerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const apiKey = generateApiKey()

    const newKey = await createApiKeyInDb({
      name,
      apiKey,
      permissions,
      ownerId,
    })

    return NextResponse.json(newKey, { status: 201 })
  } catch (error) {
    console.error("Error creating API key:", error)
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 })
  }
}
