"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { getMemoryStore } from "@/lib/memory-store"

export function MemoryStatus() {
  const [status, setStatus] = useState<"loading" | "active" | "disabled">("loading")
  const [mode, setMode] = useState<string>("local")

  useEffect(() => {
    const initializeStatus = async () => {
      try {
        const memoryStore = getMemoryStore()
        setMode(memoryStore.getStorageMode())
        setStatus("active")
      } catch (error) {
        console.error("Error initializing memory status:", error)
        setStatus("disabled")
      }
    }

    initializeStatus()
  }, [])

  if (status === "loading") {
    return <Badge variant="outline">Memory: Loading...</Badge>
  }

  if (status === "disabled") {
    return (
      <Badge variant="outline" className="bg-red-100">
        Memory: Disabled
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-green-100">
      Memory: {mode === "mem0" ? "Mem0 Cloud" : "Local Storage"}
    </Badge>
  )
}
