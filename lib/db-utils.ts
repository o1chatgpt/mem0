import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Initialize Supabase client with direct PostgreSQL connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: "public",
  },
  // Add PostgreSQL connection options
  postgresOptions: {
    host: process.env.POSTGRES_HOST,
    port: 5432,
    database: process.env.POSTGRES_DATABASE,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    max: 10, // Maximum number of connections in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  },
})

// Function to check if a table exists
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", tableName)
      .eq("table_schema", "public")

    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error(`Error in tableExists for ${tableName}:`, error)
    return false
  }
}

// Function to create the AI Family members table
export async function createAIFamilyMembersTable(): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("execute_sql", {
      sql_query: `
        CREATE TABLE IF NOT EXISTS ai_family_members (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          avatar_url TEXT,
          personality TEXT,
          system_prompt TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `,
    })

    if (error) {
      console.error("Error creating AI Family members table:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in createAIFamilyMembersTable:", error)
    return false
  }
}

// Function to create the tasks table
export async function createTasksTable(): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("execute_sql", {
      sql_query: `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        CREATE TABLE IF NOT EXISTS tasks (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          priority VARCHAR(50) DEFAULT 'medium',
          assigned_to UUID REFERENCES ai_family_members(id) ON DELETE SET NULL,
          created_by UUID,
          due_date TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `,
    })

    if (error) {
      console.error("Error creating tasks table:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in createTasksTable:", error)
    return false
  }
}

// Function to create the files table
export async function createFilesTable(): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("execute_sql", {
      sql_query: `
        CREATE TABLE IF NOT EXISTS files (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID,
          name VARCHAR(255) NOT NULL,
          path VARCHAR(255) NOT NULL,
          size INTEGER NOT NULL,
          mime_type VARCHAR(255) NOT NULL,
          storage_path VARCHAR(255) NOT NULL,
          is_public BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `,
    })

    if (error) {
      console.error("Error creating files table:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in createFilesTable:", error)
    return false
  }
}

// Function to create the folders table
export async function createFoldersTable(): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("execute_sql", {
      sql_query: `
        CREATE TABLE IF NOT EXISTS folders (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID,
          parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          path VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `,
    })

    if (error) {
      console.error("Error creating folders table:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in createFoldersTable:", error)
    return false
  }
}

// Function to create all required tables
export async function createAllTables(): Promise<boolean> {
  try {
    // First create the execute_sql function if it doesn't exist
    try {
      await supabase.query(`
        CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
        RETURNS void AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `)
    } catch (error) {
      console.error("Error creating execute_sql function:", error)
      // Continue anyway, it might already exist
    }

    const aiFamily = await createAIFamilyMembersTable()
    const tasks = await createTasksTable()
    const files = await createFilesTable()
    const folders = await createFoldersTable()

    return aiFamily && tasks && files && folders
  } catch (error) {
    console.error("Error in createAllTables:", error)
    return false
  }
}

// Function to test database connection
export async function testDatabaseConnection(): Promise<{
  success: boolean
  message: string
}> {
  try {
    const startTime = Date.now()
    const { data, error } = await supabase.from("pg_stat_database").select("*").limit(1)

    if (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
      }
    }

    const endTime = Date.now()
    const responseTime = endTime - startTime

    return {
      success: true,
      message: `Connection successful! Response time: ${responseTime}ms`,
    }
  } catch (error) {
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
