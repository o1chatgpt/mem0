"use client"

import { useEffect, useState } from "react"
import { useMem0 } from "./mem0-provider"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Mem0StatusIndicator() {
  const { apiAvailable, isInitialized, checkApiStatus } = useMem0()
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    // Check API status on mount and every 5 minutes
    const checkStatus = async () => {
      await checkApiStatus()
      setLastChecked(new Date())
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [checkApiStatus])

  if (!isInitialized) {
    return null
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Badge variant={apiAvailable ? "success" : "destructive"} className="h-6 px-2 text-xs">
              <span className={`mr-1 h-2 w-2 rounded-full ${apiAvailable ? "bg-green-500" : "bg-red-500"}`} />
              Mem0 {apiAvailable ? "Online" : "Offline"}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Mem0 API is {apiAvailable ? "available" : "unavailable"}</p>
          {lastChecked && (
            <p className="text-xs text-muted-foreground">Last checked: {lastChecked.toLocaleTimeString()}</p>
          )}
          {!apiAvailable && <p className="text-xs text-muted-foreground">Using mock data</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
