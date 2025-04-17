import { createClient } from "@supabase/supabase-js"
import { config } from "./config"

// Create a single supabase client for the entire application
const supabaseUrl = config.supabaseUrl
const supabaseAnonKey = config.supabaseAnonKey

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase URL or Anon Key. Using fallback values for development.")
}

// Use fallback values for development/preview environments
const finalSupabaseUrl = supabaseUrl || "https://biilgjnihzcxecvgjhvg.supabase.co"
const finalSupabaseAnonKey =
  supabaseAnonKey ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpaWxnam5paHpjeGVjdmdqaHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NDM4MjQsImV4cCI6MjA1ODUxOTgyNH0.etleU8E5U1DinUK6W-jo3f0R6DTW8-DLiU73yo1qDu0"

export const supabase = createClient(finalSupabaseUrl, finalSupabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Helper function to get the current session
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error("Error getting session:", error.message)
      return null
    }
    return data.session
  } catch (error) {
    console.error("Unexpected error getting session:", error)
    return null
  }
}

// Helper function to get the current user
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.error("Error getting user:", error.message)
      return null
    }
    return data.user
  } catch (error) {
    console.error("Unexpected error getting user:", error)
    return null
  }
}
