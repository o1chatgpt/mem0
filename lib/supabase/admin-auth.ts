import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Create a single supabase client for admin operations
export const createAdminClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Verify admin credentials
export async function verifyAdminCredentials(username: string, apiKey: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("username", username)
    .eq("api_key", apiKey)
    .eq("is_active", true)
    .single()

  if (error || !data) {
    return { success: false, error: "Invalid credentials" }
  }

  // Update last login time
  await supabase.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", data.id)

  return { success: true, admin: data }
}

// Create a session token for the admin
export async function createAdminSession(adminId: number) {
  const sessionToken = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

  const cookieStore = cookies()
  cookieStore.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  })

  const supabase = createAdminClient()

  // Store session in database (you would need to create this table)
  await supabase.from("admin_sessions").insert({
    admin_id: adminId,
    session_token: sessionToken,
    expires_at: expiresAt.toISOString(),
  })

  return { success: true }
}

// Verify admin session
export async function getAdminSession() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("admin_session")?.value

  if (!sessionToken) {
    return { success: false, error: "No session found" }
  }

  const supabase = createAdminClient()

  // Check if session exists and is valid
  const { data, error } = await supabase
    .from("admin_sessions")
    .select("admin_id, expires_at")
    .eq("session_token", sessionToken)
    .single()

  if (error || !data) {
    return { success: false, error: "Invalid session" }
  }

  // Check if session is expired
  if (new Date(data.expires_at) < new Date()) {
    return { success: false, error: "Session expired" }
  }

  // Get admin user
  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", data.admin_id)
    .single()

  if (adminError || !admin) {
    return { success: false, error: "Admin not found" }
  }

  return { success: true, admin }
}

// Logout admin
export async function logoutAdmin() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("admin_session")?.value

  if (sessionToken) {
    const supabase = createAdminClient()

    // Delete session from database
    await supabase.from("admin_sessions").delete().eq("session_token", sessionToken)

    // Clear cookie
    cookieStore.delete("admin_session")
  }

  return { success: true }
}
