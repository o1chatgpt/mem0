import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    // Create the ai_family_member_memories table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS public.ai_family_member_memories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        ai_family_member_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        memory TEXT NOT NULL,
        embedding VECTOR(1536),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_ai_family_member_memories_ai_family_member_id 
        ON public.ai_family_member_memories(ai_family_member_id);
      
      CREATE INDEX IF NOT EXISTS idx_ai_family_member_memories_user_id 
        ON public.ai_family_member_memories(user_id);
      
      CREATE INDEX IF NOT EXISTS idx_ai_family_member_memories_created_at 
        ON public.ai_family_member_memories(created_at);
    `

    // Execute the SQL query
    const { error } = await supabase.rpc("exec_sql", { sql_string: createTableQuery })

    if (error) {
      console.error("Error creating Mem0 tables:", error)
      return NextResponse.json({ success: false, error: "Failed to create Mem0 tables" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Mem0 tables created successfully" })
  } catch (error) {
    console.error("Error setting up Mem0:", error)
    return NextResponse.json({ success: false, error: "Failed to set up Mem0" }, { status: 500 })
  }
}
