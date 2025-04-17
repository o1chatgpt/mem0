import { type NextRequest, NextResponse } from "next/server"
import { addMemory, getMemories, searchMemories, generateResponseWithMemory } from "@/lib/mem0"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, content, aiMemberId, query, limit } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    switch (action) {
      case "add":
        if (!content) {
          return NextResponse.json({ error: "Content is required" }, { status: 400 })
        }
        const newMemory = await addMemory(content, userId, aiMemberId)
        return NextResponse.json({ memory: newMemory })

      case "get":
        const memories = await getMemories(userId, aiMemberId, limit)
        return NextResponse.json({ memories })

      case "search":
        if (!query) {
          return NextResponse.json({ error: "Query is required" }, { status: 400 })
        }
        const searchResults = await searchMemories(query, userId, aiMemberId, limit)
        return NextResponse.json({ memories: searchResults })

      case "generate":
        if (!content) {
          return NextResponse.json({ error: "Content is required" }, { status: 400 })
        }
        const response = await generateResponseWithMemory(content, userId, aiMemberId)
        return NextResponse.json(response)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in mem0 API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
