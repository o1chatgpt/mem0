import { NextResponse } from "next/server"
import { runMigrations } from "@/lib/migrations/migration-manager"
import { migrations } from "@/lib/migrations/migrations"

export async function GET() {
  try {
    // Run all migrations
    const results = await runMigrations(migrations)

    // Check if any migrations failed
    const failedMigrations = results.filter((result) => !result.success)

    if (failedMigrations.length > 0) {
      // Return details about the failed migrations
      return NextResponse.json(
        {
          success: false,
          error: "Some migrations failed to apply",
          details: failedMigrations,
        },
        { status: 500 },
      )
    }

    // If no migrations were run, it means all were already applied
    if (results.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All migrations already applied",
        appliedMigrations: 0,
      })
    }

    // Return success with details about applied migrations
    return NextResponse.json({
      success: true,
      message: "Migrations applied successfully",
      appliedMigrations: results.length,
      migrations: results.map((r) => r.name),
    })
  } catch (error) {
    console.error("Error setting up CrewAI tables:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to apply migrations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
