import { NextResponse } from "next/server"
import { runMigrations } from "@/lib/migrations/migration-manager"
import { migrations } from "@/lib/migrations/migrations"
import { executeSql, tableExists } from "@/lib/db-utils"

export async function GET() {
  try {
    // First, create the exec_sql function if it doesn't exist
    const createExecSqlFunction = `
      CREATE OR REPLACE FUNCTION exec_sql(sql_string TEXT)
      RETURNS VOID AS $$
      BEGIN
        EXECUTE sql_string;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    // Try to create the exec_sql function
    const execSqlCreated = await executeSql(createExecSqlFunction)
    console.log("exec_sql function creation result:", execSqlCreated)

    // Create the schema_migrations table if it doesn't exist
    const migrationsTableExists = await tableExists("schema_migrations")
    if (!migrationsTableExists) {
      console.log("Creating schema_migrations table...")
      const createMigrationsTableQuery = `
        CREATE TABLE IF NOT EXISTS public.schema_migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          checksum VARCHAR(64) NOT NULL,
          execution_time INTEGER NOT NULL,
          success BOOLEAN NOT NULL
        );
      `
      const migrationsTableCreated = await executeSql(createMigrationsTableQuery)
      console.log("schema_migrations table creation result:", migrationsTableCreated)

      if (!migrationsTableCreated) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create schema_migrations table",
          },
          { status: 500 },
        )
      }
    }

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
