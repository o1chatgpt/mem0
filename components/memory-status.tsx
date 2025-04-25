"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Brain } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function MemoryStatus() {
  const { memoryStore } = useAppContext()
  const [initialized, setInitialized] = useState(false)
  const [storageMode, setStorageMode] = useState<string>("initializing")

  useEffect(() => {
    const initMemory = async () => {
      try {
        await memoryStore.initialize()
        setInitialized(true)

        // Get storage mode if available
        if (typeof memoryStore.getStorageMode === "function") {
          setStorageMode(memoryStore.getStorageMode())
        } else {
          setStorageMode("local")
        }
      } catch (error) {
        console.error("Memory initialization error:", error)
        setInitialized(true) // Still mark as initialized even on error
        setStorageMode("error")
      }
    }

    initMemory()
  }, [memoryStore])

  if (!initialized) {
    return (
      <Badge variant="outline" className="animate-pulse">
        <Brain className="h-3 w-3 mr-1" />
        Initializing memory...
      </Badge>
    )
  }

  if (!memoryStore) {
    return (
      <Badge variant="outline">
        <Brain className="h-3 w-3 mr-1" />
        Memory Unavailable
      </Badge>
    )
  }

  return (
    <Badge variant={storageMode === "mem0" ? "default" : "outline"} className="text-xs">
      <Brain className="h-3 w-3 mr-1" />
      {storageMode === "mem0" ? "Mem0" : "Local"} memory
    </Badge>
  )
}
