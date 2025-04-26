"use client"

import { createContext, useContext, type ReactNode, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Mem0ContextType {
  addMemory: (aiFamily: string, memory: string) => Promise<boolean>
  getMemories: (aiFamily: string, limit?: number) => Promise<Memory[]>
  searchMemories: (aiFamily: string, query: string, limit?: number) => Promise<Memory[]>
  isLoading: boolean
}

interface Memory {
  id: string
  memory: string
  created_at: string
  ai_family_member_id: string
  user_id?: string
}

const Mem0Context = createContext<Mem0ContextType | undefined>(undefined)

export function Mem0Provider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  async function addMemory(aiFamily: string, memory: string): Promise<boolean> {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("ai_family_member_memories").insert([
        {
          ai_family_member_id: aiFamily, // Using the ID directly
          memory,
          user_id: "00000000-0000-0000-0000-000000000000", // Default user ID
        },
      ])

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error adding memory:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  async function getMemories(aiFamily: string, limit = 10): Promise<Memory[]> {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("ai_family_member_memories")
        .select("*")
        .eq("ai_family_member_id", aiFamily) // Using the ID directly
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching memories:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  async function searchMemories(aiFamily: string, query: string, limit = 10): Promise<Memory[]> {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("ai_family_member_memories")
        .select("*")
        .eq("ai_family_member_id", aiFamily) // Using the ID directly
        .ilike("memory", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error searching memories:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Mem0Context.Provider value={{ addMemory, getMemories, searchMemories, isLoading }}>
      {children}
    </Mem0Context.Provider>
  )
}

export function useMem0() {
  const context = useContext(Mem0Context)
  if (context === undefined) {
    throw new Error("useMem0 must be used within a Mem0Provider")
  }
  return context
}
