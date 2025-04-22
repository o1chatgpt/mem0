"use client"

import { createContext, useContext, type ReactNode, useState } from "react"
import { addMemory, getMemories, searchMemories, type Memory } from "@/lib/mem0"

interface Mem0ContextType {
  addMemory: (aiFamily: string, memory: string, userId?: string) => Promise<boolean>
  getMemories: (aiFamily: string, userId?: string, limit?: number) => Promise<Memory[]>
  searchMemories: (aiFamily: string, query: string, userId?: string, limit?: number) => Promise<Memory[]>
  isLoading: boolean
}

const Mem0Context = createContext<Mem0ContextType | undefined>(undefined)

export function Mem0Provider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleAddMemory(aiFamily: string, memory: string, userId = "default_user"): Promise<boolean> {
    setIsLoading(true)
    try {
      return await addMemory(aiFamily, memory, userId)
    } catch (error) {
      console.error("Error adding memory:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGetMemories(aiFamily: string, userId = "default_user", limit = 10): Promise<Memory[]> {
    setIsLoading(true)
    try {
      return await getMemories(aiFamily, userId, limit)
    } catch (error) {
      console.error("Error fetching memories:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSearchMemories(
    aiFamily: string,
    query: string,
    userId = "default_user",
    limit = 10,
  ): Promise<Memory[]> {
    setIsLoading(true)
    try {
      return await searchMemories(aiFamily, query, userId, limit)
    } catch (error) {
      console.error("Error searching memories:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Mem0Context.Provider
      value={{
        addMemory: handleAddMemory,
        getMemories: handleGetMemories,
        searchMemories: handleSearchMemories,
        isLoading,
      }}
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
