"use client"

import { createClient } from "@supabase/supabase-js"
import { useState, useEffect } from "react"

// Create a single supabase client for the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Export createClient for direct use
export { createClient }

// Create a singleton instance for client-side usage
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseInstance && typeof window !== "undefined") {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      db: {
        schema: "public",
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        fetch: fetch,
      },
    })
  }
  return supabaseInstance
}

// Export the supabase client directly
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: "public",
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: fetch,
  },
})

export const supabaseClient = supabase

// For server components
export const createSupabaseServerClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
    db: {
      schema: "public",
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: fetch,
    },
  })
}

// For server actions
export const createSupabaseActionClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_ANON_KEY || "", {
    db: {
      schema: "public",
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
    global: {
      fetch: fetch,
    },
  })
}

// Hook for using Supabase in components
export function useSupabase() {
  const [client, setClient] = useState<ReturnType<typeof createClient> | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        db: {
          schema: "public",
        },
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        global: {
          fetch: fetch,
        },
      })
      setClient(supabaseClient)
    }
  }, [])

  return client
}
