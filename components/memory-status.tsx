"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Brain } from "lucide-react"
import { mem0Integration } from "@/lib/mem0-integration"

export function MemoryStatus() {
  const { memoryStore } = useAppContext()
  const [isEnabled, setIsEnabled] = useState(false)
  const [memoryCount, setMemoryCount] = useState(0)
  const [storageMode, setStorageMode] = useState("local")

  useEffect(() => {
    const checkStatus = async () => {
      // Check if mem0 is enabled
      const mem0Enabled = await mem0Integration.initialize()
      setIsEnabled(mem0Enabled)

      // Get storage mode
      setStorageMode(memoryStore.getStorageMode ? memoryStore.getStorageMode() : "local")

      // Get memory count
      const memories = memoryStore.getMemories()
      setMemoryCount(memories.length)
    }

    checkStatus()
  }, [memoryStore])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Badge variant={isEnabled ? "default" : "outline"} className="flex items-center gap-1 cursor-help">
              <Brain className="h-3 w-3" />
              <span className="text-xs">
                {isEnabled ? "mem0" : "local"} ({memoryCount})
              </span>
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Memory storage: {storageMode}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {isEnabled
              ? "Using mem0 API for enhanced memory capabilities"
              : "Using local storage for basic memory features"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
