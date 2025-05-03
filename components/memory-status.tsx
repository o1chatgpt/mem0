"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Database, Brain } from "lucide-react"
import { dbService } from "@/lib/db-service"
import { mem0Client } from "@/lib/mem0-client"

export function MemoryStatus() {
  const { memoryStore } = useAppContext()
  const [initialized, setInitialized] = useState(false)
  const [storageMode, setStorageMode] = useState<"api" | "database" | "local">("local")
  const [dbFallback, setDbFallback] = useState(false)
  const [structuredEndpointAvailable, setStructuredEndpointAvailable] = useState(false)
  const [memoryEndpointAvailable, setMemoryEndpointAvailable] = useState(false)

  useEffect(() => {
    const initMemory = async () => {
      try {
        await memoryStore.initialize()
        setStorageMode(memoryStore.getStorageMode())
        setDbFallback(dbService.isUsingLocalFallback())

        // Check if the functions exist before calling them
        setStructuredEndpointAvailable(
          typeof mem0Client.isStructuredEndpointAvailable === "function"
            ? mem0Client.isStructuredEndpointAvailable()
            : false,
        )

        setMemoryEndpointAvailable(
          typeof mem0Client.isApiAvailable === "function" ? mem0Client.isApiAvailable() : false,
        )

        setInitialized(true)
      } catch (error) {
        console.error("Memory initialization error:", error)
        setInitialized(true) // Still mark as initialized even on error
      }
    }

    initMemory()
  }, [memoryStore])

  if (!initialized) {
    return (
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">Initializing memory system...</AlertDescription>
      </Alert>
    )
  }

  if (storageMode === "api" && memoryEndpointAvailable) {
    return (
      <Alert className="mb-4 bg-green-50 border-green-200">
        <Brain className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-700">
          Using Mem0 API for memory storage. Your data will be persisted across sessions.
          {dbFallback && " Database is using local fallback storage."}
          {!structuredEndpointAvailable && " Structured memory endpoint is not available, using local fallback."}
        </AlertDescription>
      </Alert>
    )
  }

  if (storageMode === "database" && !dbFallback) {
    return (
      <Alert className="mb-4 bg-purple-50 border-purple-200">
        <Database className="h-4 w-4 text-purple-500" />
        <AlertDescription className="text-purple-700">
          Using database for memory storage. Your data will be persisted across sessions.
        </AlertDescription>
      </Alert>
    )
  }

  // Local storage or database with fallback
  return (
    <Alert className="mb-4 bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-500" />
      <AlertDescription className="text-blue-700">
        Using local memory storage. Your data will be stored in this browser session only.
        {!memoryEndpointAvailable && " Mem0 API memory endpoint is not available."}
        {!structuredEndpointAvailable && " Mem0 API structured endpoint is not available."}
      </AlertDescription>
    </Alert>
  )
}
