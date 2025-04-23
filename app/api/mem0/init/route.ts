import { NextResponse } from "next/server"
import { initializeMemoryTables } from "@/lib/mem0"

export async function POST() {
  try {
    const result = await initializeMemoryTables()

    if (result.success) {
      return NextResponse.json({ success: true, message: "Memory tables initialized successfully" })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error initializing memory tables:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
