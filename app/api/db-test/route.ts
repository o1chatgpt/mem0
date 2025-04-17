import { NextResponse } from "next/server"
import { testDatabaseConnection } from "@/lib/db-utils"

export async function GET() {
  try {
    const result = await testDatabaseConnection()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Database test error:", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
        error: error,
      },
      { status: 500 },
    )
  }
}
