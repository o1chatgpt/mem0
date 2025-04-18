import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import { getEnvVar } from "@/lib/env-validator"

// Create a singleton instance for client-side
let clientInstance: ReturnType<typeof createClient> | null = null

export function createClientComponentClient() {
  if (clientInstance) return clientInstance

  const supabaseUrl = getEnvVar("NEXT_PUBLIC_SUPABASE_URL")
  const supabaseAnonKey = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY")

  if (!supabaseUrl) {
    throw new Error("Supabase URL is required. Please set NEXT_PUBLIC_SUPABASE_URL environment variable.")
  }

  if (!supabaseAnonKey) {
    throw new Error("Supabase Anon Key is required. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.")
  }

  clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
  return clientInstance
}

// Server-side client (for server components and server actions)
export function createServerClient() {
  const supabaseUrl = getEnvVar("SUPABASE_URL")
  const supabaseServiceKey = getEnvVar("SUPABASE_SERVICE_ROLE_KEY")

  if (!supabaseUrl) {
    throw new Error("Supabase URL is required. Please set SUPABASE_URL environment variable.")
  }

  if (!supabaseServiceKey) {
    throw new Error("Supabase Service Role Key is required. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}
