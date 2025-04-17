import { createServerSupabaseClient } from "@/lib/db"
import { redirect } from "next/navigation"
import { Dashboard } from "@/components/dashboard"
import { getUserIntegrations } from "@/lib/db"

export default async function DashboardPage() {
  // Check if Supabase environment variables are set
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in dashboard page")
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-white mb-4">Configuration Error</h1>
          <p className="text-gray-400 mb-6">
            Supabase environment variables are missing. Please make sure SUPABASE_URL and SUPABASE_ANON_KEY are properly
            configured in your environment.
          </p>
          <a href="/" className="text-primary hover:underline">
            Return to home page
          </a>
        </div>
      </div>
    )
  }

  // Get the Supabase client and check for a session
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session, redirect to login - this must be outside any try/catch
  if (!session) {
    return redirect("/login")
  }

  // If we get here, we have a session, so fetch user integrations
  let userIntegrations = []
  try {
    userIntegrations = await getUserIntegrations(session.user.id)
  } catch (error) {
    console.error("Error fetching user integrations:", error)
    // Continue with empty integrations
  }

  // Render the dashboard with user data
  return <Dashboard user={session.user} userIntegrations={userIntegrations} />
}
