import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db"

export async function POST() {
  try {
    const supabase = createServerClient()

    // Create the function to create the memories table
    const createMemoriesTableFn = `
      CREATE OR REPLACE FUNCTION create_memories_table()
      RETURNS void AS $$
      BEGIN
        -- Check if table exists
        IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fm_memories') THEN
          -- Create the table
          CREATE TABLE public.fm_memories (
            id SERIAL PRIMARY KEY,
            content TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            ai_member_id INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            category TEXT
          );
          
          -- Create indexes
          CREATE INDEX idx_memories_user_id ON public.fm_memories(user_id);
          CREATE INDEX idx_memories_ai_member_id ON public.fm_memories(ai_member_id);
          CREATE INDEX idx_memories_category ON public.fm_memories(category);
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `

    // Create the function to create the memory categories table
    const createCategoriesTableFn = `
      CREATE OR REPLACE FUNCTION create_memory_categories_table()
      RETURNS void AS $$
      BEGIN
        -- Check if table exists
        IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fm_memory_categories') THEN
          -- Create the table
          CREATE TABLE public.fm_memory_categories (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            color TEXT,
            icon TEXT,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Create indexes
          CREATE INDEX idx_memory_categories_user_id ON public.fm_memory_categories(user_id);
          CREATE INDEX idx_memory_categories_name ON public.fm_memory_categories(name);
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `

    // Execute the SQL to create the functions
    const { error: error1 } = await supabase.rpc("create_sql_function", {
      sql_function: createMemoriesTableFn,
    })

    const { error: error2 } = await supabase.rpc("create_sql_function", {
      sql_function: createCategoriesTableFn,
    })

    if (error1 || error2) {
      console.error("Error creating SQL functions:", error1 || error2)
      return NextResponse.json(
        {
          success: false,
          error: error1 || error2,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "SQL functions created successfully",
    })
  } catch (error) {
    console.error("Error setting up database:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    )
  }
}
