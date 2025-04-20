"use client"

import type React from "react"
import type { FamilyMember } from "@/types/family-member"

import { createContext, useContext, useEffect, useState } from "react"
import { Memory } from "./memory"
import { Loader2 } from "lucide-react"

type Mem0ContextType = {
  memory: Memory | null
  isInitialized: boolean
  isLoading: boolean
  error: string | null
  currentFamilyMember: FamilyMember | null
  setCurrentFamilyMember: (member: FamilyMember) => void
  familyMembers: FamilyMember[]
  addFamilyMember: (member: Omit<FamilyMember, "id" | "createdAt">) => Promise<FamilyMember>
  updateFamilyMember: (
    id: string,
    updates: Partial<Omit<FamilyMember, "id" | "createdAt">>,
  ) => Promise<FamilyMember | null>
  deleteFamilyMember: (id: string) => Promise<boolean>
  addMemory: (content: string, userId?: string, familyMemberId?: string) => Promise<void>
  searchMemories: (query: string, userId?: string, limit?: number, familyMemberId?: string) => Promise<any>
  generateWithMemory: (prompt: string, userId?: string, familyMemberId?: string) => Promise<string>
  clearMemories: (userId?: string, familyMemberId?: string) => Promise<void>
}

const Mem0Context = createContext<Mem0ContextType>({
  memory: null,
  isInitialized: false,
  isLoading: false,
  error: null,
  currentFamilyMember: null,
  setCurrentFamilyMember: () => {},
  familyMembers: [],
  addFamilyMember: async () => ({ id: "", name: "", role: "", createdAt: "" }),
  updateFamilyMember: async () => null,
  deleteFamilyMember: async () => false,
  addMemory: async () => {},
  searchMemories: async () => ({ results: [] }),
  generateWithMemory: async () => "",
  clearMemories: async () => {},
})

export const useMem0 = () => useContext(Mem0Context)

export function Mem0Provider({ children }: { children: React.ReactNode }) {
  const [memory, setMemory] = useState<Memory | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [currentFamilyMember, setCurrentFamilyMember] = useState<FamilyMember | null>(null)

  useEffect(() => {
    const initializeMemory = async () => {
      try {
        setIsLoading(true)
        // Get API key from localStorage or environment variable
        const apiKey = localStorage.getItem("openai_api_key") || process.env.OPENAI_API_KEY || ""

        if (!apiKey) {
          throw new Error("API key not found. Please set it in your profile settings.")
        }

        const memoryInstance = new Memory(apiKey)

        // Test the API key with a simple request
        try {
          await memoryInstance.testConnection()
        } catch (connectionError) {
          console.error("Connection test failed:", connectionError)
          throw new Error(
            `API connection failed: ${connectionError.message}. Please check your API key and model access.`,
          )
        }

        // Load family members
        const members = memoryInstance.getFamilyMembers()
        setFamilyMembers(members)

        // Set default family member
        if (members.length > 0) {
          setCurrentFamilyMember(members[0])
        }

        setMemory(memoryInstance)
        setIsInitialized(true)
        setError(null)
      } catch (error) {
        console.error("Failed to initialize Mem0:", error)
        setError(error instanceof Error ? error.message : "Failed to initialize memory system")
        setIsInitialized(false)
      } finally {
        setIsLoading(false)
      }
    }

    initializeMemory()
  }, [])

  const addMemory = async (content: string, userId = "default_user", familyMemberId?: string) => {
    if (!memory) return

    try {
      setIsLoading(true)
      const messages = [{ role: "user", content }]
      await memory.add(messages, userId, familyMemberId || currentFamilyMember?.id || "default")
    } catch (error) {
      console.error("Failed to add memory:", error)
      setError(error instanceof Error ? error.message : "Failed to add memory")
    } finally {
      setIsLoading(false)
    }
  }

  const searchMemories = async (query: string, userId = "default_user", limit = 5, familyMemberId?: string) => {
    if (!memory) return { results: [] }

    try {
      setIsLoading(true)
      return await memory.search(query, userId, limit, familyMemberId || currentFamilyMember?.id || "default")
    } catch (error) {
      console.error("Failed to search memories:", error)
      setError(error instanceof Error ? error.message : "Failed to search memories")
      return { results: [] }
    } finally {
      setIsLoading(false)
    }
  }

  const generateWithMemory = async (prompt: string, userId = "default_user", familyMemberId?: string) => {
    if (!memory) return "Memory system not initialized"

    try {
      setIsLoading(true)
      return await memory.generateWithMemory(prompt, userId, familyMemberId || currentFamilyMember?.id || "default")
    } catch (error) {
      console.error("Failed to generate response:", error)
      setError(error instanceof Error ? error.message : "Failed to generate response")
      return "I encountered an error while processing your request."
    } finally {
      setIsLoading(false)
    }
  }

  const clearMemories = async (userId = "default_user", familyMemberId?: string) => {
    if (!memory) return

    try {
      setIsLoading(true)
      await memory.clearMemories(userId, familyMemberId)
    } catch (error) {
      console.error("Failed to clear memories:", error)
      setError(error instanceof Error ? error.message : "Failed to clear memories")
    } finally {
      setIsLoading(false)
    }
  }

  const addFamilyMember = async (member: Omit<FamilyMember, "id" | "createdAt">) => {
    if (!memory) throw new Error("Memory system not initialized")

    try {
      setIsLoading(true)
      const newMember = memory.addFamilyMember(member)
      setFamilyMembers(memory.getFamilyMembers())
      return newMember
    } catch (error) {
      console.error("Failed to add family member:", error)
      setError(error instanceof Error ? error.message : "Failed to add family member")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateFamilyMember = async (id: string, updates: Partial<Omit<FamilyMember, "id" | "createdAt">>) => {
    if (!memory) return null

    try {
      setIsLoading(true)
      const updatedMember = memory.updateFamilyMember(id, updates)
      setFamilyMembers(memory.getFamilyMembers())

      // Update current family member if it's the one being updated
      if (updatedMember && currentFamilyMember?.id === id) {
        setCurrentFamilyMember(updatedMember)
      }

      return updatedMember
    } catch (error) {
      console.error("Failed to update family member:", error)
      setError(error instanceof Error ? error.message : "Failed to update family member")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deleteFamilyMember = async (id: string) => {
    if (!memory) return false

    try {
      setIsLoading(true)
      const success = memory.deleteFamilyMember(id)

      if (success) {
        setFamilyMembers(memory.getFamilyMembers())

        // If the current family member is deleted, switch to the default one
        if (currentFamilyMember?.id === id) {
          const defaultMember = memory.getFamilyMember("default")
          if (defaultMember) {
            setCurrentFamilyMember(defaultMember)
          }
        }
      }

      return success
    } catch (error) {
      console.error("Failed to delete family member:", error)
      setError(error instanceof Error ? error.message : "Failed to delete family member")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Initializing AI memory system...</p>
        </div>
      </div>
    )
  }

  return (
    <Mem0Context.Provider
      value={{
        memory,
        isInitialized,
        isLoading,
        error,
        currentFamilyMember,
        setCurrentFamilyMember,
        familyMembers,
        addFamilyMember,
        updateFamilyMember,
        deleteFamilyMember,
        addMemory,
        searchMemories,
        generateWithMemory,
        clearMemories,
      }}
    >
      {children}
    </Mem0Context.Provider>
  )
}
