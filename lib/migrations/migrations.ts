import type { Migration } from "./migration-manager"

/**
 * List of all migrations in the system
 * The name should follow the format: YYYYMMDD_HHMMSS_description
 * This ensures migrations run in chronological order
 */
export const migrations: Migration[] = [
  {
    name: "20240422_000001_create_uuid_extension",
    description: "Creates the UUID extension if it doesn't exist",
    sql: `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `,
  },
  {
    name: "20240422_000002_create_ai_tasks_table",
    description: "Creates the AI tasks table",
    sql: `
      CREATE TABLE IF NOT EXISTS public.ai_tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        assigned_to TEXT,
        created_by TEXT NOT NULL,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        due_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        handoff_to TEXT,
        handoff_reason TEXT,
        result TEXT,
        skills_required TEXT[]
      );
    `,
  },
  {
    name: "20240422_000003_create_ai_crews_table",
    description: "Creates the AI crews table",
    sql: `
      CREATE TABLE IF NOT EXISTS public.ai_crews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        agents TEXT[] NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
  },
  {
    name: "20240422_000004_add_indexes_to_ai_tasks",
    description: "Adds indexes to the AI tasks table for better performance",
    sql: `
      CREATE INDEX IF NOT EXISTS idx_ai_tasks_assigned_to ON public.ai_tasks(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON public.ai_tasks(status);
      CREATE INDEX IF NOT EXISTS idx_ai_tasks_created_at ON public.ai_tasks(created_at);
    `,
  },
  {
    name: "20240422_000005_add_tags_to_ai_tasks",
    description: "Adds tags column to the AI tasks table for categorization",
    sql: `
     ALTER TABLE public.ai_tasks 
     ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
     
     -- Create an index on the tags column for better performance when filtering by tags
     CREATE INDEX IF NOT EXISTS idx_ai_tasks_tags ON public.ai_tasks USING GIN(tags);
     
     -- Add a comment to the column for documentation
     COMMENT ON COLUMN public.ai_tasks.tags IS 'Array of tags for categorizing tasks';
   `,
  },
]
