"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { useAppContext } from "@/lib/app-context"
import { useMem0 } from "@/components/mem0-provider"

export function MemoryStatus() {
  const [status, setStatus] = useState<"loading" | "active" | "disabled" | "error">("loading")
  const [mode, setMode] = useState<string>("local")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { memoryStore } = useAppContext()
  const { isInitialized, isLoading, error } = useMem0()

  useEffect(() => {
    // Only run in the browser
    if (typeof window === "undefined") return

    const initializeStatus = async () => {
      try {
        // Check if Mem0 client is initialized via the provider
        if (isInitialized) {
          setMode("mem0")
          setStatus("active")
          return
        }

        // Fall back to memory store
        if (memoryStore) {
          const storageMode = memoryStore.getStorageMode ? memoryStore.getStorageMode() : "local"
          setMode(storageMode)
          setStatus("active")
        } else {
          setStatus("disabled")
        }
      } catch (err) {
        console.error("Error initializing memory status:", err)

        let message = "Memory initialization failed"
        if (err instanceof Error) {
          message = err.message
        }

        setErrorMessage(message)
        setStatus("error")
      }
    }

    initializeStatus()
  }, [memoryStore, isInitialized])

  // Use error from Mem0Provider if available
  useEffect(() => {
    if (error) {
      setErrorMessage(error)
      setStatus("error")
    }
  }, [error])

  if (status === "loading" || isLoading) {
    return <Badge variant="outline">Memory: Loading...</Badge>
  }

  if (status === "disabled") {
    return (
      <Badge variant="outline" className="bg-red-100">
        Memory: Disabled
      </Badge>
    )
  }

  if (status === "error") {
    return (
      <Badge variant="outline" className="bg-red-100" title={errorMessage || undefined}>
        Memory: Error
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-green-100">
      Memory: {mode === "mem0" ? "Mem0 Cloud" : "Local Storage"}
    </Badge>
  )
}
