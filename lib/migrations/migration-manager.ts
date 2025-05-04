import { supabase } from "@/lib/db-utils"
import { ensureMigrationsTable } from "./ensure-migrations-table"
import crypto from "crypto"
import { executeSql, tableExists } from "@/lib/db-utils"

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
    // Check if the migrations table exists
    const exists = await tableExists("schema_migrations")
    if (!exists) {
      console.log("Migrations table does not exist, no applied migrations")
      return []
    }

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
    console.log(`Running migration: ${migration.name}`)

    // Execute the SQL query
    const success = await executeSql(migration.sql)

    const executionTime = Date.now() - startTime

    if (!success) {
      console.error(`Failed to execute migration SQL for ${migration.name}`)
      return {
        name: migration.name,
        success: false,
        error: "Failed to execute migration SQL. Check database permissions.",
        executionTime,
      }
    }

    // Ensure migrations table exists before recording the migration
    const migrationsTableExists = await tableExists("schema_migrations")
    if (!migrationsTableExists) {
      console.error("Migrations table does not exist after attempting to create it")
      return {
        name: migration.name,
        success: false,
        error: "Migration executed but migrations table does not exist",
        executionTime,
      }
    }

    // Record the migration in the migrations table
    const checksum = calculateChecksum(migration.sql)
    try {
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
    } catch (insertError) {
      console.error(`Error inserting migration record for ${migration.name}:`, insertError)
      return {
        name: migration.name,
        success: false,
        error: `Migration executed but failed to record in database`,
        executionTime,
      }
    }

    console.log(`Migration ${migration.name} completed successfully in ${executionTime}ms`)
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
 * Gets the status of all migrations
 * This function has been updated to better handle the case where the migrations table doesn't exist
 */
export async function getMigrationStatus(migrations: Migration[]): Promise<
  {
    name: string
    applied: boolean
    appliedAt?: string
  }[]
> {
  try {
    // Check if the migrations table exists
    const exists = await tableExists("schema_migrations")

    // If the table doesn't exist, return all migrations as not applied
    // without trying to query the non-existent table
    if (!exists) {
      console.log("Migrations table doesn't exist, returning all migrations as not applied")
      return migrations.map((migration) => ({
        name: migration.name,
        applied: false,
      }))
    }

    // Only try to query the table if it exists
    try {
      // Get all applied migrations with their timestamps
      const { data, error } = await supabase.from("schema_migrations").select("name, applied_at")

      if (error) {
        // If the error is about the relation not existing (could happen if table was dropped between checks)
        if (
          error.message.includes('relation "schema_migrations" does not exist') ||
          error.message.includes('relation "public.schema_migrations" does not exist')
        ) {
          console.log("Table schema_migrations does not exist (detected in query)")
          return migrations.map((migration) => ({
            name: migration.name,
            applied: false,
          }))
        }

        // If there's another error (e.g., permission issues), log it and return all as not applied
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
    } catch (queryError) {
      // If the error is about the relation not existing (could happen if table was dropped between checks)
      if (
        queryError instanceof Error &&
        (queryError.message.includes('relation "schema_migrations" does not exist') ||
          queryError.message.includes('relation "public.schema_migrations" does not exist'))
      ) {
        console.log("Table schema_migrations does not exist (caught in exception)")
        return migrations.map((migration) => ({
          name: migration.name,
          applied: false,
        }))
      }

      console.error("Error querying migrations table:", queryError)
      return migrations.map((migration) => ({
        name: migration.name,
        applied: false,
      }))
    }
  } catch (error) {
    console.error("Error in getMigrationStatus:", error)
    // Return all migrations as not applied if there's an error
    return migrations.map((migration) => ({
      name: migration.name,
      applied: false,
    }))
  }
}
