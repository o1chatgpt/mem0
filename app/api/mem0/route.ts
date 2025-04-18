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
  updateCategoryPromptTemplate,
} from "@/lib/mem0"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, content, aiMemberId, query, limit, category, memoryId, categoryId, promptTemplate } = body

    if (!userId && !["updateMemoryCategory", "updateCategoryPromptTemplate"].includes(action)) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    switch (action) {
      case "add":
        if (!content) {
          return NextResponse.json({ error: "Content is required" }, { status: 400 })
        }
        const newMemory = await addMemory(content, userId, aiMemberId, category)
        return NextResponse.json({ memory: newMemory })

      case "get":
        const memories = await getMemories(userId, aiMemberId, limit, category)
        return NextResponse.json({ memories })

      case "search":
        if (!query) {
          return NextResponse.json({ error: "Query is required" }, { status: 400 })
        }
        const searchResults = await searchMemories(query, userId, aiMemberId, limit, category)
        return NextResponse.json({ memories: searchResults })

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
            },
            { status: 500 },
          )
        }

      case "stats":
        const stats = await getMemoryStats(userId, aiMemberId)
        return NextResponse.json({ stats })

      case "getCategories":
        const categories = await getMemoryCategories(userId)
        return NextResponse.json({ categories })

      case "createCategory":
        if (!body.category) {
          return NextResponse.json({ error: "Category data is required" }, { status: 400 })
        }
        const newCategory = await createMemoryCategory(body.category)
        return NextResponse.json({ category: newCategory })

      case "updateMemoryCategory":
        if (!memoryId) {
          return NextResponse.json({ error: "Memory ID is required" }, { status: 400 })
        }
        const updatedMemory = await updateMemoryCategory(memoryId, category)
        return NextResponse.json({ memory: updatedMemory })

      case "updateCategoryPromptTemplate":
        if (!categoryId) {
          return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
        }
        const updatedCategory = await updateCategoryPromptTemplate(categoryId, promptTemplate)
        return NextResponse.json({ category: updatedCategory })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in mem0 API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
