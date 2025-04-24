import { NextResponse } from "next/server"
import { getMigrationStatus } from "@/lib/migrations/migration-manager"
import { migrations } from "@/lib/migrations/migrations"
import { tableExists } from "@/lib/db-utils"

export async function GET() {
  try {
    // First check if the migrations table exists
    const exists = await tableExists("schema_migrations")

    // If the table doesn't exist, return a special response
    if (!exists) {
      return NextResponse.json({
        success: true,
        migrations: migrations.map((m) => ({ name: m.name, applied: false })),
        totalMigrations: migrations.length,
        appliedMigrations: 0,
        pendingMigrations: migrations.length,
        needsSetup: true,
        message: "Database migrations table does not exist yet. Run setup to create it.",
      })
    }

    // If the table exists, get the migration status
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

    // Return a more informative error response
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get migration status. Database tables may need to be set up first.",
        details: error instanceof Error ? error.message : "Unknown error",
        migrations: migrations.map((m) => ({ name: m.name, applied: false })),
        totalMigrations: migrations.length,
        appliedMigrations: 0,
        pendingMigrations: migrations.length,
      },
      { status: 500 },
    )
  }
}
