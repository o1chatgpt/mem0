import { NextResponse } from "next/server"
import { supabase } from "@/lib/db-utils"

export async function POST() {
  try {
    // First, create the stored procedure if it doesn't exist
    const createProcedureSQL = `
      CREATE OR REPLACE FUNCTION create_user_settings_table()
      RETURNS void AS $$
      BEGIN
        -- Create the extension if it doesn't exist
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        -- Create the table if it doesn't exist
        CREATE TABLE IF NOT EXISTS user_settings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL UNIQUE,
          openai_api_key TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create index on user_id for faster lookups
        CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
      END;
      $$ LANGUAGE plpgsql;
    `

    // Create the stored procedure
    const { error: procError } = await supabase.rpc("exec_sql", { sql_string: createProcedureSQL })

    if (procError) {
      console.error("Error creating stored procedure:", procError)
      return NextResponse.json({ success: false, error: procError.message }, { status: 500 })
    }

    // Now call the stored procedure to create the table
    const { error } = await supabase.rpc("create_user_settings_table")

    if (error) {
      console.error("Error calling stored procedure:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "User settings table created successfully" })
  } catch (error) {
    console.error("Error in setup-user-settings API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
