import { type NextRequest, NextResponse } from "next/server"
import {
  addMemory,
  getMemories,
  searchMemories,
  generateResponseWithMemory,
  getMemoryStats,
  getMemoryCategories,
  createMemoryCategory,
  updateMemoryCategory,
  initializeMemoryTables,
} from "@/lib/mem0"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, content, aiMemberId, query, limit, category, memoryId } = body

    // Initialize tables first to ensure they exist
    if (action === "getCategories" || action === "createCategory") {
      await initializeMemoryTables()
    }

    if (!userId && !["updateMemoryCategory"].includes(action)) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    switch (action) {
      case "add":
        if (!content) {
          return NextResponse.json({ error: "Content is required" }, { status: 400 })
        }
        try {
          const newMemory = await addMemory(content, userId, aiMemberId, category)
          return NextResponse.json({ memory: newMemory })
        } catch (error) {
          console.error("Error adding memory:", error)
          return NextResponse.json({ error: "Failed to add memory", details: String(error) }, { status: 500 })
        }

      case "get":
        try {
          const memories = await getMemories(userId, aiMemberId, limit, category)
          return NextResponse.json({ memories })
        } catch (error) {
          console.error("Error getting memories:", error)
          return NextResponse.json({ memories: [], error: String(error) }, { status: 500 })
        }

      case "search":
        if (!query) {
          return NextResponse.json({ error: "Query is required" }, { status: 400 })
        }
        try {
          const searchResults = await searchMemories(query, userId, aiMemberId, limit, category)
          return NextResponse.json({ memories: searchResults })
        } catch (error) {
          console.error("Error searching memories:", error)
          return NextResponse.json({ memories: [], error: String(error) }, { status: 500 })
        }

      case "generate":
        if (!content) {
          return NextResponse.json({ error: "Content is required" }, { status: 400 })
        }
        try {
          const response = await generateResponseWithMemory(content, userId, aiMemberId, category)
          return NextResponse.json(response)
        } catch (error) {
          console.error("Error generating response:", error)
          let errorMessage = "Internal server error"

          if (error instanceof Error) {
            // Check for model access errors
            if (error.message.includes("does not have access to model")) {
              errorMessage = "AI model unavailable. Please try again later."
            }
          }

          return NextResponse.json(
            {
              error: errorMessage,
              text: "I'm sorry, I'm having trouble connecting to my AI capabilities right now. Please try again later.",
              details: String(error),
            },
            { status: 500 },
          )
        }

      case "stats":
        try {
          const stats = await getMemoryStats(userId, aiMemberId)
          return NextResponse.json({ stats })
        } catch (error) {
          console.error("Error getting memory stats:", error)
          return NextResponse.json({ stats: {}, error: String(error) }, { status: 500 })
        }

      case "getCategories":
        try {
          // This function now handles errors internally and returns an empty array instead of throwing
          const categories = await getMemoryCategories(userId)
          return NextResponse.json({ categories })
        } catch (error) {
          console.error("Error in getCategories:", error)
          return NextResponse.json({ categories: [], error: String(error) }, { status: 500 })
        }

      case "createCategory":
        if (!body.category) {
          return NextResponse.json({ error: "Category data is required" }, { status: 400 })
        }
        try {
          const newCategory = await createMemoryCategory(body.category)
          return NextResponse.json({ category: newCategory })
        } catch (error) {
          console.error("Error creating category:", error)
          return NextResponse.json({ error: "Failed to create category", details: String(error) }, { status: 500 })
        }

      case "updateMemoryCategory":
        if (!memoryId) {
          return NextResponse.json({ error: "Memory ID is required" }, { status: 400 })
        }
        try {
          const updatedMemory = await updateMemoryCategory(memoryId, category)
          return NextResponse.json({ memory: updatedMemory })
        } catch (error) {
          console.error("Error updating memory category:", error)
          return NextResponse.json(
            { error: "Failed to update memory category", details: String(error) },
            { status: 500 },
          )
        }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in mem0 API:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
