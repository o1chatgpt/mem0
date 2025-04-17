import { NextResponse } from "next/server"
import { mem0Client } from "@/lib/mem0-client"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { content, metadata } = body

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const result = await mem0Client.createMemory(content, metadata)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating memory:", error)
    return NextResponse.json({ error: "Failed to create memory" }, { status: 500 })
  }
}
