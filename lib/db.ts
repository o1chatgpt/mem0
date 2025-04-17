import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a singleton instance for client-side
let clientInstance: ReturnType<typeof createClient> | null = null

export function createClientComponentClient() {
  if (clientInstance) return clientInstance

  clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
  return clientInstance
}

// Server-side client (for server components and server actions)
export function createServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}
