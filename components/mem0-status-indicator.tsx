"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Brain, Database } from "lucide-react"
import { checkMem0ApiConnection } from "@/lib/mem0-integration"

export function Mem0StatusIndicator() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "checking">("checking")

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check if settings exist in localStorage
        const savedSettings = localStorage.getItem("mem0Settings")
        if (!savedSettings) {
          // If no settings, check with server-side credentials
          const apiStatus = await checkMem0ApiConnection()
          setStatus(apiStatus)
          return
        }

        // Get settings from localStorage
        const settings = JSON.parse(savedSettings)
        const apiKey = settings.apiKey
        const apiUrl = settings.apiUrl

        if (!apiKey || !apiUrl) {
          setStatus("disconnected")
          return
        }

        // Check connection with custom credentials
        const apiStatus = await checkMem0ApiConnection(apiKey, apiUrl)
        setStatus(apiStatus)
      } catch (error) {
        console.error("Error checking Mem0 status:", error)
        setStatus("disconnected")
      }
    }

    checkStatus()
  }, [])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            {status === "checking" ? (
              <Badge variant="outline" className="animate-pulse">
                Checking Mem0...
              </Badge>
            ) : status === "connected" ? (
              <Badge
                variant="success"
                className="flex items-center gap-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
              >
                <Brain className="h-3 w-3" />
                Mem0 Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                Using Local Storage
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {status === "checking"
            ? "Checking Mem0 API connection..."
            : status === "connected"
              ? "Configured to use Mem0 API. Falling back to local storage if needed."
              : "Using local database for memory storage. Configure Mem0 in settings."}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
