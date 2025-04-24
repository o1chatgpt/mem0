import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    // Check if MEM0_API_KEY is configured
    const mem0ApiKey = process.env.MEM0_API_KEY
    const mem0ApiUrl = process.env.MEM0_API_URL

    if (!mem0ApiKey || !mem0ApiUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Mem0 API key or URL not configured. Please set MEM0_API_KEY and MEM0_API_URL environment variables.",
        },
        { status: 400 },
      )
    }

    // Create a fallback table for storing memories if Mem0 API is unavailable
    const { error: tableError } = await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE TABLE IF NOT EXISTS public.file_memories (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          file_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          memory TEXT NOT NULL,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_file_memories_file_id ON public.file_memories(file_id);
        CREATE INDEX IF NOT EXISTS idx_file_memories_user_id ON public.file_memories(user_id);
      `,
    })

    if (tableError) {
      console.error("Error creating file_memories table:", tableError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create fallback memories table",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Mem0 integration set up successfully",
    })
  } catch (error) {
    console.error("Error setting up Mem0:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to set up Mem0 integration",
      },
      { status: 500 },
    )
  }
}
