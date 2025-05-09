import { type NextRequest, NextResponse } from "next/server"
import { executeSql } from "@/lib/db-utils"
import { migrations } from "@/lib/migrations/migrations"
import { ensureMigrationsTable } from "@/lib/migrations/ensure-migrations-table"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { specificMigration } = body

    // Ensure the migrations table exists
    const tableCreated = await ensureMigrationsTable()
    if (!tableCreated) {
      return NextResponse.json({ success: false, error: "Failed to create migrations table" }, { status: 500 })
    }

    // If a specific migration is requested, run only that one
    if (specificMigration) {
      const migration = migrations.find((m) => m.name === specificMigration)

      if (!migration) {
        return NextResponse.json(
          { success: false, error: `Migration '${specificMigration}' not found` },
          { status: 404 },
        )
      }

      // Execute the migration
      const success = await executeSql(migration.sql)

      if (!success) {
        return NextResponse.json(
          { success: false, error: `Failed to execute migration '${migration.name}'` },
          { status: 500 },
        )
      }

      // Record the migration in the migrations table
      const recordSql = `
        INSERT INTO migrations (name, applied_at)
        VALUES ('${migration.name}', NOW())
        ON CONFLICT (name) DO NOTHING;
      `

      await executeSql(recordSql)

      return NextResponse.json({
        success: true,
        message: `Migration '${migration.name}' applied successfully`,
      })
    }

    // If no specific migration is requested, return an error
    return NextResponse.json({ success: false, error: "No migration specified" }, { status: 400 })
  } catch (error) {
    console.error("Error running migration:", error)
    return NextResponse.json({ success: false, error: "Failed to run migration" }, { status: 500 })
  }
}
