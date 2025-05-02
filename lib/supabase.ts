import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Validate configuration
if (!supabaseUrl) {
  console.error("Supabase URL is missing. Please check your environment variables.")
}

if (!supabaseKey) {
  console.error("Supabase key is missing. Please check your environment variables.")
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseKey)
}
