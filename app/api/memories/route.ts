import { type NextRequest, NextResponse } from "next/server"
import { createMemory, deleteMemoriesByUser } from "@/lib/db/memories"

export async function POST(request: NextRequest) {
  try {
    const { userId, aiFamilyMemberId, memory, relevance = 1.0 } = await request.json()

    if (!userId || !aiFamilyMemberId || !memory) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await createMemory(aiFamilyMemberId, userId, memory, relevance)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating memory:", error)
    return NextResponse.json({ error: "Failed to create memory" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, aiFamilyMemberId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const deletedCount = await deleteMemoriesByUser(userId, aiFamilyMemberId)

    return NextResponse.json({ deletedCount })
  } catch (error) {
    console.error("Error deleting memories:", error)
    return NextResponse.json({ error: "Failed to delete memories" }, { status: 500 })
  }
}
