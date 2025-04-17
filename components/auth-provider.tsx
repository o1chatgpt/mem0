"use client"

import { useEffect, useState, createContext, useContext, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Session } from "@supabase/supabase-js"

type AuthContextType = {
  session: Session | null
  isLoading: boolean
  user: any | null
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  user: null,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        setSession(data.session)
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    session,
    isLoading,
    user: session?.user ?? null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
