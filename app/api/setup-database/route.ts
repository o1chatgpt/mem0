import { NextResponse } from "next/server"
import { createAllTables } from "@/lib/db-utils"

export async function POST(request: Request) {
  try {
    const result = await createAllTables()

    if (result) {
      return NextResponse.json({
        success: true,
        message: "Database tables created successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create database tables",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Database setup error:", error)

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
