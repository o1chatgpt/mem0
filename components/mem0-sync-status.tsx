"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Clock, AlertTriangle, CheckCircle2 } from "lucide-react"
import { mem0SyncService, type SyncStats } from "@/lib/mem0-sync-service"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Mem0SyncStatus() {
  const [syncStats, setSyncStats] = useState<SyncStats>(mem0SyncService.getSyncStats())
  const [isApiConnected, setIsApiConnected] = useState<boolean | null>(null)
  const [isCheckingApi, setIsCheckingApi] = useState(false)
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false)
  const { toast } = useToast()

  // Check API connection on mount
  useEffect(() => {
    checkApiConnection()

    // Set up sync stats listener
    const unsubscribe = mem0SyncService.addSyncListener((stats) => {
      setSyncStats(stats)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const checkApiConnection = async () => {
    setIsCheckingApi(true)
    try {
      const isConnected = await mem0SyncService.checkApiConnection()
      setIsApiConnected(isConnected)
    } catch (error) {
      console.error("Error checking API connection:", error)
      setIsApiConnected(false)
    } finally {
      setIsCheckingApi(false)
    }
  }

  const handleSync = async () => {
    if (syncStats.inProgress) return

    toast({
      title: "Synchronization Started",
      description: "Synchronizing memories between local storage and Mem0 API...",
    })

    try {
      const result = await mem0SyncService.synchronizeMemories("default_user", "file_manager")

      if (result.success) {
        toast({
          title: "Synchronization Complete",
          description: `Successfully synchronized ${result.stats.synced} memories.`,
        })
      } else {
        toast({
          title: "Synchronization Issues",
          description: `Completed with ${result.errors.length} errors. ${result.stats.synced} memories synchronized.`,
          variant: "warning",
        })
      }
    } catch (error) {
      console.error("Error during synchronization:", error)
      toast({
        title: "Synchronization Failed",
        description: error instanceof Error ? error.message : "Unknown error during synchronization",
        variant: "destructive",
      })
    }
  }

  const toggleAutoSync = () => {
    if (autoSyncEnabled) {
      mem0SyncService.stopAutoSync()
      setAutoSyncEnabled(false)
      toast({
        title: "Auto-Sync Disabled",
        description: "Automatic synchronization has been turned off.",
      })
    } else {
      mem0SyncService.startAutoSync(5) // 5 minute interval
      setAutoSyncEnabled(true)
      toast({
        title: "Auto-Sync Enabled",
        description: "Memories will automatically synchronize every 5 minutes.",
      })
    }
  }

  // Calculate sync percentage
  const syncPercentage = syncStats.total === 0 ? 100 : Math.round((syncStats.synced / syncStats.total) * 100)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Memory Synchronization</CardTitle>
            <CardDescription>Keep your memories in sync across devices</CardDescription>
          </div>
          {isApiConnected !== null && (
            <Badge
              variant={isApiConnected ? "outline" : "destructive"}
              className={isApiConnected ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300" : ""}
            >
              {isApiConnected ? "API Connected" : "API Disconnected"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Sync Status</span>
            <span>{syncPercentage}% Complete</span>
          </div>
          <Progress value={syncPercentage} className="h-2" />
        </div>

        {/* Sync Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Memories:</span>
            <Badge variant="outline">{syncStats.total}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Synced:</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
              {syncStats.synced}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Local Only:</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
              {syncStats.localOnly}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Remote Only:</span>
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
            >
              {syncStats.remoteOnly}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Conflicts:</span>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              {syncStats.conflicts}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Failed:</span>
            <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {syncStats.failed}
            </Badge>
          </div>
        </div>

        {/* Last Synced */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-2" />
          {syncStats.lastSyncedAt ? (
            <span>Last synced: {new Date(syncStats.lastSyncedAt).toLocaleString()}</span>
          ) : (
            <span>Never synced</span>
          )}
        </div>

        {/* Sync Status Indicator */}
        {syncStats.inProgress && (
          <div className="flex items-center justify-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-blue-600 dark:text-blue-400">Synchronization in progress...</span>
          </div>
        )}

        {!isApiConnected && !isCheckingApi && (
          <div className="flex items-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md">
            <AlertTriangle className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
            <span className="text-amber-600 dark:text-amber-400">
              API connection not available. Sync will use local database only.
            </span>
          </div>
        )}

        {syncStats.failed > 0 && (
          <div className="flex items-center p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
            <AlertTriangle className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />
            <span className="text-red-600 dark:text-red-400">
              {syncStats.failed} items failed to sync. Try again or check settings.
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoSync}
                className={autoSyncEnabled ? "bg-green-50 border-green-200 dark:bg-green-900/20" : ""}
              >
                {autoSyncEnabled ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                    Auto-Sync On
                  </>
                ) : (
                  "Enable Auto-Sync"
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {autoSyncEnabled
                  ? "Automatic synchronization is enabled (every 5 minutes)"
                  : "Enable automatic synchronization every 5 minutes"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button onClick={handleSync} disabled={syncStats.inProgress || isCheckingApi} className="relative">
          <RefreshCw className={`h-4 w-4 mr-2 ${syncStats.inProgress ? "animate-spin" : ""}`} />
          {syncStats.inProgress ? "Syncing..." : "Sync Now"}
        </Button>
      </CardFooter>
    </Card>
  )
}
