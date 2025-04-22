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
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get migration status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
