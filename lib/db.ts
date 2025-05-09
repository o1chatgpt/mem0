import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a singleton instance for client-side
let clientInstance: ReturnType<typeof createClient> | null = null

export function createClientComponentClient() {
  // Check if environment variables are available
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables are missing. Client component functionality will be limited.")
    // Return a mock client that won't throw errors but won't work either
    return createMockClient()
  }

  if (clientInstance) return clientInstance

  try {
    clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
    return clientInstance
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    return createMockClient()
  }
}

// Server-side client (for server components and server actions)
export function createServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""

  // Check if environment variables are available
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase environment variables are missing. Server functionality will be limited.")
    // Return a mock client that won't throw errors but won't work either
    return createMockClient()
  }

  try {
    return createClient<Database>(supabaseUrl, supabaseServiceKey)
  } catch (error) {
    console.error("Error creating Supabase server client:", error)
    return createMockClient()
  }
}

// Create a mock client that won't throw errors when methods are called
function createMockClient() {
  const mockResponse = { data: null, error: new Error("Supabase client not initialized") }

  return {
    from: () => ({
      select: () => ({
        eq: () => mockResponse,
        neq: () => mockResponse,
        gt: () => mockResponse,
        lt: () => mockResponse,
        gte: () => mockResponse,
        lte: () => mockResponse,
        like: () => mockResponse,
        ilike: () => mockResponse,
        is: () => mockResponse,
        in: () => mockResponse,
        contains: () => mockResponse,
        containedBy: () => mockResponse,
        rangeLt: () => mockResponse,
        rangeGt: () => mockResponse,
        rangeGte: () => mockResponse,
        rangeLte: () => mockResponse,
        rangeAdjacent: () => mockResponse,
        overlaps: () => mockResponse,
        textSearch: () => mockResponse,
        match: () => mockResponse,
        not: () => mockResponse,
        or: () => mockResponse,
        filter: () => mockResponse,
        order: () => mockResponse,
        limit: () => mockResponse,
        range: () => mockResponse,
        single: () => mockResponse,
        maybeSingle: () => mockResponse,
      }),
      insert: () => mockResponse,
      upsert: () => mockResponse,
      update: () => mockResponse,
      delete: () => mockResponse,
    }),
    rpc: () => mockResponse,
    auth: {
      signUp: () => Promise.resolve(mockResponse),
      signIn: () => Promise.resolve(mockResponse),
      signOut: () => Promise.resolve(mockResponse),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: () => Promise.resolve(mockResponse),
      getUser: () => Promise.resolve(mockResponse),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve(mockResponse),
        download: () => Promise.resolve(mockResponse),
        list: () => Promise.resolve(mockResponse),
        remove: () => Promise.resolve(mockResponse),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },
  } as any
}
