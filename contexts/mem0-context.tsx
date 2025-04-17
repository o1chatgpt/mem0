"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { mem0Service } from "@/lib/mem0/mem0-service"

interface Mem0ContextType {
  addMemory: (userId: string, memory: string) => Promise<boolean>
  searchMemories: (userId: string, query: string, limit?: number) => Promise<any>
  addConversationMemory: (userId: string, messages: Array<{ role: string; content: string }>) => Promise<boolean>
  deleteMemories: (userId: string) => Promise<boolean>
  isInitialized: boolean
}

const Mem0Context = createContext<Mem0ContextType | undefined>(undefined)

export const useMem0 = () => {
  const context = useContext(Mem0Context)
  if (context === undefined) {
    throw new Error("useMem0 must be used within a Mem0Provider")
  }
  return context
}

interface Mem0ProviderProps {
  children: ReactNode
}

export const Mem0Provider: React.FC<Mem0ProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize Mem0 service
    setIsInitialized(true)
  }, [])

  const value = {
    addMemory: mem0Service.addMemory.bind(mem0Service),
    searchMemories: mem0Service.searchMemories.bind(mem0Service),
    addConversationMemory: mem0Service.addConversationMemory.bind(mem0Service),
    deleteMemories: mem0Service.deleteMemories.bind(mem0Service),
    isInitialized,
  }

  return <Mem0Context.Provider value={value}>{children}</Mem0Context.Provider>
}
