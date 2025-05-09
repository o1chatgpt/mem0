"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Brain, Database, AlertCircle } from "lucide-react"
import { checkMem0ApiConnection } from "@/lib/mem0-integration"
import { Button } from "@/components/ui/button"

export function Mem0StatusIndicator() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "checking">("checking")
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const checkStatus = async () => {
    try {
      setStatus("checking")
      setErrorDetails(null)
      setIsRetrying(true)

      // Check if we're in a browser environment
      if (typeof window === "undefined") {
        console.log("Server context detected, cannot check API connection")
        setStatus("disconnected")
        setErrorDetails("Cannot check connection in server context")
        setIsRetrying(false)
        return
      }

      // Check if settings exist in localStorage
      let savedSettings
      try {
        savedSettings = localStorage.getItem("mem0Settings")
      } catch (error) {
        console.error("Error accessing localStorage:", error)
        setStatus("disconnected")
        setErrorDetails("Cannot access localStorage")
        setIsRetrying(false)
        return
      }

      if (!savedSettings) {
        // If no settings, assume disconnected
        setStatus("disconnected")
        setErrorDetails("No Mem0 API settings found")
        setIsRetrying(false)
        return
      }

      // Get settings from localStorage
      let settings
      try {
        settings = JSON.parse(savedSettings)
      } catch (error) {
        console.error("Error parsing settings from localStorage:", error)
        setStatus("disconnected")
        setErrorDetails("Invalid settings format")
        setIsRetrying(false)
        return
      }

      const apiKey = settings.apiKey
      const apiUrl = settings.apiUrl

      if (!apiKey || !apiUrl) {
        setStatus("disconnected")
        setErrorDetails("Missing API key or URL in settings")
        setIsRetrying(false)
        return
      }

      console.log("Checking Mem0 connection with:", {
        apiUrl,
        apiKey: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : "undefined",
      })

      // Check connection with custom credentials
      const apiStatus = await checkMem0ApiConnection(apiKey, apiUrl)

      console.log("Mem0 connection status:", apiStatus)

      setStatus(apiStatus)

      if (apiStatus === "disconnected") {
        setErrorDetails("Connection failed. Please check your API URL and key.")
      }
    } catch (error) {
      console.error("Error checking Mem0 status:", error)
      setStatus("disconnected")
      setErrorDetails(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsRetrying(false)
    }
  }

  useEffect(() => {
    // Wrap in try-catch to prevent any errors from breaking the UI
    try {
      checkStatus()
    } catch (error) {
      console.error("Unhandled error in Mem0StatusIndicator:", error)
      setStatus("disconnected")
      setErrorDetails("Unexpected error occurred")
      setIsRetrying(false)
    }
  }, [])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
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

            {status === "disconnected" && !isRetrying && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  checkStatus()
                }}
              >
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {status === "checking" ? (
            "Checking Mem0 API connection..."
          ) : status === "connected" ? (
            "Configured to use Mem0 API. Falling back to local storage if needed."
          ) : (
            <div className="space-y-2">
              <p>Using local database for memory storage. Configure Mem0 in settings.</p>
              {errorDetails && <p className="text-xs text-amber-500">{errorDetails}</p>}
              {!isRetrying && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 w-full text-xs"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    checkStatus()
                  }}
                >
                  Retry Connection
                </Button>
              )}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
