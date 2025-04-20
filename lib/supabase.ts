import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a singleton instance for client-side usage
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (supabaseInstance) return supabaseInstance

  // Check if the required environment variables are available
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    )

    // In development, provide a mock client to prevent crashes
    if (process.env.NODE_ENV === "development") {
      console.warn("Using mock Supabase client for development. Authentication features will not work.")
      return {
        auth: {
          signInWithPassword: async () => ({ data: null, error: new Error("Mock Supabase client") }),
          signUp: async () => ({ data: null, error: new Error("Mock Supabase client") }),
          signOut: async () => ({ error: null }),
          getSession: async () => ({ data: { session: null } }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        },
        from: () => ({
          select: () => ({ data: [], error: null }),
          insert: () => ({ data: null, error: null }),
          update: () => ({ data: null, error: null }),
          eq: () => ({ data: null, error: null, order: () => ({ data: null, error: null }) }),
        }),
      } as any
    }

    throw new Error("Supabase URL and anon key are required")
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "supabase-auth",
      detectSessionInUrl: true,
      flowType: "implicit",
    },
  })

  return supabaseInstance
})()
