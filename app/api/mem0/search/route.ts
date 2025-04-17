import { NextResponse } from "next/server"
import { mem0Client } from "@/lib/mem0-client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const result = await mem0Client.searchMemories(query, limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error searching memories:", error)
    return NextResponse.json({ error: "Failed to search memories" }, { status: 500 })
  }
}
