"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type ConnectionStatus = "connected" | "disconnected" | "connecting" | "error"

interface ApiConnectionContextType {
  apiKey: string | null
  setApiKey: (key: string | null) => void
  connectionStatus: ConnectionStatus
  validateApiKey: (key: string) => Promise<boolean>
}

const ApiConnectionContext = createContext<ApiConnectionContextType>({
  apiKey: null,
  setApiKey: () => {},
  connectionStatus: "disconnected",
  validateApiKey: async () => false,
})

export function ApiConnectionProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected")

  useEffect(() => {
    // Load API key from localStorage on component mount
    const storedApiKey = localStorage.getItem("openai_api_key")
    if (storedApiKey) {
      setApiKey(storedApiKey)
      setConnectionStatus("connected")
    }
  }, [])

  useEffect(() => {
    // Save API key to localStorage when it changes
    if (apiKey) {
      localStorage.setItem("openai_api_key", apiKey)
    }
  }, [apiKey])

  const validateApiKey = async (key: string): Promise<boolean> => {
    // Simulate API key validation
    return new Promise((resolve) => {
      setTimeout(() => {
        const isValid = key.startsWith("sk-") && key.length > 20
        resolve(isValid)
      }, 500)
    })
  }

  const contextValue: ApiConnectionContextType = {
    apiKey,
    setApiKey,
    connectionStatus,
    validateApiKey,
  }

  return <ApiConnectionContext.Provider value={contextValue}>{children}</ApiConnectionContext.Provider>
}

export const useApiConnection = () => {
  const context = useContext(ApiConnectionContext)
  if (context === undefined) {
    throw new Error("useApiConnection must be used within an ApiConnectionProvider")
  }
  return context
}
