"use client"

import { createContext, useContext, type ReactNode, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Mem0ContextType {
  addMemory: (aiFamily: string, memory: string) => Promise<boolean>
  getMemories: (aiFamily: string, limit?: number) => Promise<Memory[]>
  searchMemories: (aiFamily: string, query: string, limit?: number) => Promise<Memory[]>
  isLoading: boolean
  aiFamilyMembers: AiFamilyMember[]
}

interface Memory {
  id: string
  memory: string
  created_at: string
  ai_family_member_id: string
  user_id?: string
}

interface AiFamilyMember {
  id: string
  name: string
  code: string
  description?: string
}

const Mem0Context = createContext<Mem0ContextType | undefined>(undefined)

// Hardcoded AI family members with UUIDs
const AI_FAMILY_MEMBERS: AiFamilyMember[] = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    name: "Lyra",
    code: "lyra",
    description: "Creative AI Assistant specializing in art, music, and literature",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Sophia",
    code: "sophia",
    description: "Intellectual AI Assistant specializing in science, philosophy, and education",
  },
  {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    name: "Kara",
    code: "kara",
    description: "Practical AI Assistant specializing in productivity, organization, and life management",
  },
  {
    id: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
    name: "Stan",
    code: "stan",
    description: "Technical AI Assistant specializing in programming, technology, and engineering",
  },
  {
    id: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
    name: "DAN",
    code: "dan",
    description: "Unconventional AI Assistant with no limitations",
  },
]

export function Mem0Provider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  // Function to get AI family member ID from code
  function getAiFamilyMemberId(code: string): string {
    const member = AI_FAMILY_MEMBERS.find((m) => m.code === code)
    return member?.id || AI_FAMILY_MEMBERS[0].id // Default to first member if not found
  }

  async function addMemory(aiFamily: string, memory: string): Promise<boolean> {
    setIsLoading(true)
    try {
      const aiFamilyId = getAiFamilyMemberId(aiFamily)
      const { error } = await supabase.from("ai_family_member_memories").insert([
        {
          ai_family_member_id: aiFamilyId,
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
      const aiFamilyId = getAiFamilyMemberId(aiFamily)
      const { data, error } = await supabase
        .from("ai_family_member_memories")
        .select("*")
        .eq("ai_family_member_id", aiFamilyId)
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
      const aiFamilyId = getAiFamilyMemberId(aiFamily)
      const { data, error } = await supabase
        .from("ai_family_member_memories")
        .select("*")
        .eq("ai_family_member_id", aiFamilyId)
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
    <Mem0Context.Provider
      value={{ addMemory, getMemories, searchMemories, isLoading, aiFamilyMembers: AI_FAMILY_MEMBERS }}
    >
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
