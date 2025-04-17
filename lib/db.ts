import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// This is a server-side client
export function createServerSupabaseClient() {
  const cookieStore = cookies()

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Missing Supabase credentials. Make sure SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    )

    // In development, provide a mock client to prevent crashes during rendering
    if (process.env.NODE_ENV === "development") {
      console.warn("Using mock Supabase client for development. Database features will not work.")
      return {
        from: () => ({
          select: () => ({ data: [], error: null }),
          insert: () => ({ data: null, error: null }),
          update: () => ({ data: null, error: null }),
        }),
        auth: {
          getSession: async () => ({ data: { session: null } }),
        },
      } as any
    }

    throw new Error("Supabase URL and anon key are required")
  }

  return createClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

// Types for our database tables
export interface Integration {
  id: string
  name: string
  description: string
  category: string
  logo_url: string
  is_popular: boolean
  created_at: string
}

export interface UserIntegration {
  id: string
  user_id: string
  integration_id: string
  config: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

// Database operations
export async function getIntegrations() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("integrations").select("*").order("name")

    if (error) {
      console.error("Error fetching integrations:", error)
      return []
    }

    return data as Integration[]
  } catch (error) {
    console.error("Exception fetching integrations:", error)
    return []
  }
}

export async function getUserIntegrations(userId: string) {
  try {
    if (!userId) {
      console.error("getUserIntegrations called with no userId")
      return []
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("user_integrations")
      .select(`
        *,
        integrations (*)
      `)
      .eq("user_id", userId)
      .order("is_active", { ascending: false })
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching user integrations:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception fetching user integrations:", error)
    return []
  }
}

export async function connectIntegration(userId: string, integrationId: string, config: Record<string, any> = {}) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("user_integrations")
      .upsert({
        user_id: userId,
        integration_id: integrationId,
        config,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Error connecting integration:", error)
      throw error
    }

    return data[0]
  } catch (error) {
    console.error("Exception connecting integration:", error)
    throw error
  }
}

export async function disconnectIntegration(userId: string, integrationId: string) {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from("user_integrations")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("integration_id", integrationId)

    if (error) {
      console.error("Error disconnecting integration:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Exception disconnecting integration:", error)
    throw error
  }
}
