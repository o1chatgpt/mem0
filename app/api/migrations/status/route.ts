import { NextResponse } from "next/server"
import { getMigrationStatus } from "@/lib/migrations/migration-manager"
import { migrations } from "@/lib/migrations/migrations"

export async function GET() {
  try {
    const status = await getMigrationStatus(migrations)

    return NextResponse.json({
      success: true,
      migrations: status,
      totalMigrations: migrations.length,
      appliedMigrations: status.filter((m) => m.applied).length,
      pendingMigrations: status.filter((m) => !m.applied).length,
    })
  } catch (error) {
    console.error("Error getting migration status:", error)

    // Check if the error is related to the migrations table not existing
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const isTableNotExistError =
      typeof errorMessage === "string" && errorMessage.includes("relation") && errorMessage.includes("does not exist")

    if (isTableNotExistError) {
      return NextResponse.json(
        {
          success: false,
          error: "The migrations table does not exist yet. You need to set up the database first.",
          details: errorMessage,
          code: "TABLE_NOT_EXIST",
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get migration status",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
