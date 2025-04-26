import { createClient } from "@supabase/supabase-js"
import { ensureMigrationsTable } from "./ensure-migrations-table"
import crypto from "crypto"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export interface Migration {
  name: string
  sql: string
  description?: string
}

export interface MigrationResult {
  name: string
  success: boolean
  error?: string
  executionTime: number
}

/**
 * Calculates a checksum for a SQL script
 */
function calculateChecksum(sql: string): string {
  return crypto.createHash("sha256").update(sql).digest("hex")
}

/**
 * Gets a list of all applied migrations
 */
export async function getAppliedMigrations(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("schema_migrations")
      .select("name")
      .order("applied_at", { ascending: true })

    if (error) {
      console.error("Error fetching applied migrations:", error)
      return []
    }

    return data.map((migration) => migration.name)
  } catch (error) {
    console.error("Error in getAppliedMigrations:", error)
    return []
  }
}

/**
 * Runs a single migration
 */
export async function runMigration(migration: Migration): Promise<MigrationResult> {
  const startTime = Date.now()
  try {
    // Execute the SQL query
    const { error } = await supabase.rpc("exec_sql", { sql_string: migration.sql })

    const executionTime = Date.now() - startTime

    if (error) {
      console.error(`Error running migration ${migration.name}:`, error)
      return {
        name: migration.name,
        success: false,
        error: error.message,
        executionTime,
      }
    }

    // Record the migration in the migrations table
    const checksum = calculateChecksum(migration.sql)
    const { error: recordError } = await supabase.from("schema_migrations").insert([
      {
        name: migration.name,
        checksum,
        execution_time: executionTime,
        success: true,
      },
    ])

    if (recordError) {
      console.error(`Error recording migration ${migration.name}:`, recordError)
      return {
        name: migration.name,
        success: false,
        error: `Migration executed but failed to record: ${recordError.message}`,
        executionTime,
      }
    }

    return {
      name: migration.name,
      success: true,
      executionTime,
    }
  } catch (error) {
    const executionTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error(`Error in runMigration for ${migration.name}:`, error)
    return {
      name: migration.name,
      success: false,
      error: errorMessage,
      executionTime,
    }
  }
}

/**
 * Runs all pending migrations
 */
export async function runMigrations(migrations: Migration[]): Promise<MigrationResult[]> {
  try {
    // Ensure migrations table exists
    const tableExists = await ensureMigrationsTable()
    if (!tableExists) {
      return [
        {
          name: "ensure_migrations_table",
          success: false,
          error: "Failed to create migrations table",
          executionTime: 0,
        },
      ]
    }

    // Get list of applied migrations
    const appliedMigrations = await getAppliedMigrations()

    // Filter out migrations that have already been applied
    const pendingMigrations = migrations.filter((migration) => !appliedMigrations.includes(migration.name))

    // Sort migrations by name to ensure they run in the correct order
    pendingMigrations.sort((a, b) => a.name.localeCompare(b.name))

    // Run each migration in sequence
    const results: MigrationResult[] = []
    for (const migration of pendingMigrations) {
      const result = await runMigration(migration)
      results.push(result)

      // Stop if a migration fails
      if (!result.success) {
        break
      }
    }

    return results
  } catch (error) {
    console.error("Error in runMigrations:", error)
    return [
      {
        name: "run_migrations",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        executionTime: 0,
      },
    ]
  }
}

/**
 * Gets the migration status
 */
export async function getMigrationStatus(migrations: Migration[]): Promise<
  {
    name: string
    applied: boolean
    appliedAt?: string
  }[]
> {
  try {
    // Ensure migrations table exists
    const tableExists = await ensureMigrationsTable()
    if (!tableExists) {
      console.log("Migrations table does not exist, returning all migrations as not applied")
      return migrations.map((migration) => ({
        name: migration.name,
        applied: false,
      }))
    }

    // Get all applied migrations with their timestamps
    const { data, error } = await supabase.from("schema_migrations").select("name, applied_at")

    if (error) {
      console.error("Error fetching migration status:", error)
      return migrations.map((migration) => ({
        name: migration.name,
        applied: false,
      }))
    }

    // Create a map of applied migrations
    const appliedMigrationsMap = new Map(data.map((m) => [m.name, m.applied_at]))

    // Return status for each migration
    return migrations.map((migration) => ({
      name: migration.name,
      applied: appliedMigrationsMap.has(migration.name),
      appliedAt: appliedMigrationsMap.get(migration.name),
    }))
  } catch (error) {
    console.error("Error in getMigrationStatus:", error)
    return migrations.map((migration) => ({
      name: migration.name,
      applied: false,
    }))
  }
}
