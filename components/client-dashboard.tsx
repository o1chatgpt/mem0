"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Dashboard } from "@/components/dashboard"
import { supabase } from "@/lib/supabase"

export function ClientDashboard() {
  const { session, isLoading, user } = useAuth()
  const [userIntegrations, setUserIntegrations] = useState([])
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // If not loading and no session, redirect to login
    if (!isLoading && !session) {
      router.push("/login")
    }
  }, [isLoading, session, router])

  useEffect(() => {
    // Fetch user integrations if we have a user
    const fetchUserIntegrations = async () => {
      if (!user) return

      try {
        setIsLoadingIntegrations(true)
        const { data, error } = await supabase
          .from("user_integrations")
          .select(`
            *,
            integrations (*)
          `)
          .eq("user_id", user.id)
          .order("is_active", { ascending: false })
          .order("updated_at", { ascending: false })

        if (error) {
          console.error("Error fetching user integrations:", error)
          return
        }

        setUserIntegrations(data || [])
      } catch (error) {
        console.error("Exception fetching user integrations:", error)
      } finally {
        setIsLoadingIntegrations(false)
      }
    }

    if (user) {
      fetchUserIntegrations()
    }
  }, [user])

  // Show loading state
  if (isLoading || (session && isLoadingIntegrations)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Loading your dashboard...</h2>
          <p className="text-gray-400 mt-2">This may take a moment</p>
        </div>
      </div>
    )
  }

  // If we have a user and integrations, render the dashboard
  if (user) {
    return <Dashboard user={user} userIntegrations={userIntegrations} />
  }

  // This should not be visible as we redirect in the useEffect
  return null
}
