"use client"

import { useState, useEffect } from "react"
import { syncService, type SyncStatus } from "@/lib/sync-service"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Cloud, CloudOff, RefreshCw, AlertCircle } from "lucide-react"

export function SyncStatusIndicator() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        await syncService.initialize("default-user")
        setInitialized(true)
      } catch (error) {
        console.error("Error initializing sync service:", error)
        setInitialized(true)
      }
    }

    init()

    // Subscribe to sync status updates
    const unsubscribe = syncService.subscribe((status) => {
      setSyncStatus(status)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleSync = async () => {
    try {
      await syncService.syncNow()
    } catch (error) {
      console.error("Error syncing:", error)
    }
  }

  if (!initialized) {
    return (
      <Badge variant="outline" className="animate-pulse">
        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
        Initializing...
      </Badge>
    )
  }

  const isSyncAvailable = syncStatus && syncStatus.devices.length > 0

  if (!isSyncAvailable) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline">
              <CloudOff className="h-3 w-3 mr-1" />
              Local Only
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Cross-device sync is not available</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (syncStatus?.error) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="destructive" className="cursor-pointer" onClick={handleSync}>
              <AlertCircle className="h-3 w-3 mr-1" />
              Sync Error
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{syncStatus.error}</p>
            <p className="text-xs mt-1">Click to retry</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (syncStatus?.inProgress) {
    return (
      <Badge variant="outline">
        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
        Syncing...
      </Badge>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="cursor-pointer" onClick={handleSync}>
            <Cloud className="h-3 w-3 mr-1 text-primary" />
            Synced
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {syncStatus?.lastSynced
              ? `Last synced: ${new Date(syncStatus.lastSynced).toLocaleTimeString()}`
              : "Click to sync now"}
          </p>
          <p className="text-xs mt-1">Connected to {syncStatus?.devices.length || 0} devices</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
