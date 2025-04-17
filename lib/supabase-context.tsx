"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "./supabase-client"
import { authService, type UserProfile } from "./auth-service"

interface SupabaseContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null; message?: string }>
  signOut: () => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      setIsLoading(true)
      try {
        const { data } = await supabase.auth.getSession()
        setSession(data.session)
        setUser(data.session?.user || null)

        if (data.session?.user) {
          const profile = await authService.getUserProfile(data.session.user.id)
          setUserProfile(profile)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth event: ${event}`)
      setSession(session)
      setUser(session?.user || null)

      if (session?.user) {
        const profile = await authService.getUserProfile(session.user.id)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const refreshProfile = async () => {
    if (user) {
      const profile = await authService.getUserProfile(user.id)
      setUserProfile(profile)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error, user } = await authService.signIn(email, password)
    if (user && !error) {
      const profile = await authService.getUserProfile(user.id)
      setUserProfile(profile)
    }
    return { error }
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Validate inputs
      if (!email || !password || !username) {
        return { error: new Error("Email, password, and username are required") }
      }

      const { error, user } = await authService.signUp(email, password, username)

      // If user was created successfully but no session (email confirmation required)
      if (user && !error) {
        return {
          error: null,
          message: "Registration successful! Please check your email to confirm your account.",
        }
      }

      return { error }
    } catch (error) {
      console.error("Sign up error in context:", error)
      return { error: error instanceof Error ? error : new Error("An unknown error occurred") }
    }
  }

  const signOut = async () => {
    const { error } = await authService.signOut()
    if (!error) {
      setUserProfile(null)
    }
    return { error }
  }

  const value = {
    user,
    session,
    userProfile,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}
