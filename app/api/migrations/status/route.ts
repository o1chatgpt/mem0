import { NextResponse } from "next/server"
import { migrations } from "@/lib/migrations/migrations"
import { tableExists } from "@/lib/db-utils"
import { supabase } from "@/lib/db-utils"

export async function GET() {
  try {
    // First check if the migrations table exists
    const exists = await tableExists("schema_migrations")

    // If the table doesn't exist, return a special response
    if (!exists) {
      console.log("Migration status API: schema_migrations table does not exist")
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

    // If the table exists, get the migration status directly
    try {
      // Get all applied migrations with their timestamps
      const { data, error } = await supabase.from("schema_migrations").select("name, applied_at")

      if (error) {
        // If there's an error, check if it's because the table doesn't exist
        if (
          error.message.includes('relation "schema_migrations" does not exist') ||
          error.message.includes('relation "public.schema_migrations" does not exist')
        ) {
          // Table doesn't exist, return the same response as above
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

        // For other errors, throw to be caught by the outer catch
        throw error
      }

      // Create a map of applied migrations
      const appliedMigrationsMap = new Map(data.map((m) => [m.name, m.applied_at]))

      // Create the status for each migration
      const status = migrations.map((migration) => ({
        name: migration.name,
        applied: appliedMigrationsMap.has(migration.name),
        appliedAt: appliedMigrationsMap.get(migration.name),
      }))

      return NextResponse.json({
        success: true,
        migrations: status,
        totalMigrations: migrations.length,
        appliedMigrations: status.filter((m) => m.applied).length,
        pendingMigrations: status.filter((m) => !m.applied).length,
      })
    } catch (statusError) {
      console.error("Error getting migration status:", statusError)
      throw statusError // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error("Error in migration status API:", error)

    // Return a more informative error response
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get migration status. Database tables may need to be set up first.",
        details: error instanceof Error ? error.message : String(error),
        migrations: migrations.map((m) => ({ name: m.name, applied: false })),
        totalMigrations: migrations.length,
        appliedMigrations: 0,
        pendingMigrations: migrations.length,
        needsSetup: true,
      },
      { status: 500 },
    )
  }
}
