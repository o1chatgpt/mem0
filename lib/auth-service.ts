import { supabase } from "./supabase-client"
import type { User, Session } from "@supabase/supabase-js"

export interface AuthResponse {
  user: User | null
  session: Session | null
  error: Error | null
}

export interface UserProfile {
  id: string
  username: string
  email: string
  avatar_url?: string
  role: "admin" | "editor" | "viewer" | "ai_assistant"
  created_at: string
  updated_at: string
}

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, username: string): Promise<AuthResponse> {
    try {
      // First check if the email is already in use
      const { data: existingUsers } = await supabase.from("users").select("email").eq("email", email).limit(1)

      if (existingUsers && existingUsers.length > 0) {
        return {
          user: null,
          session: null,
          error: new Error("Email already in use"),
        }
      }

      // Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      })

      if (error) throw error

      // Create user profile in the profiles table only if user was created
      if (data.user) {
        try {
          const { error: profileError } = await supabase.from("users").insert([
            {
              id: data.user.id,
              username,
              email,
              role: "viewer", // Default role
            },
          ])

          if (profileError) {
            console.error("Error creating user profile:", profileError)
            // Don't throw here, just log the error
          }
        } catch (profileError) {
          console.error("Error creating user profile:", profileError)
          // Don't throw here, just log the error
        }
      }

      return {
        user: data.user,
        session: data.session,
        error: null,
      }
    } catch (error) {
      console.error("Sign up error:", error)
      return {
        user: null,
        session: null,
        error: error as Error,
      }
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return {
        user: data.user,
        session: data.session,
        error: null,
      }
    } catch (error) {
      console.error("Sign in error:", error)
      return {
        user: null,
        session: null,
        error: error as Error,
      }
    }
  },

  // Sign in with magic link
  async signInWithMagicLink(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error("Magic link error:", error)
      return { error: error as Error }
    }
  },

  // Sign out
  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error("Sign out error:", error)
      return { error: error as Error }
    }
  },

  // Get current session
  async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return data.session
    } catch (error) {
      console.error("Get session error:", error)
      return null
    }
  },

  // Get current user
  async getUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      return data.user
    } catch (error) {
      console.error("Get user error:", error)
      return null
    }
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Get user profile error:", error)
      return null
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Update user profile error:", error)
      return null
    }
  },

  // Reset password
  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error("Reset password error:", error)
      return { error: error as Error }
    }
  },

  // Update password
  async updatePassword(password: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error("Update password error:", error)
      return { error: error as Error }
    }
  },
}
