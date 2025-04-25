"use client"

import { useState, useEffect } from "react"
import { syncService, type SyncDevice, type SyncStatus } from "@/lib/sync-service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  Trash2,
  Edit,
  Check,
  X,
  Cloud,
  CloudOff,
  Clock,
  AlertCircle,
  Info,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

export function DeviceManager() {
  const { toast } = useToast()
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [devices, setDevices] = useState<SyncDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [newDeviceName, setNewDeviceName] = useState("")
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [deviceToRemove, setDeviceToRemove] = useState<SyncDevice | null>(null)
  const [autoSync, setAutoSync] = useState(true)

  // Initialize and load devices
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        // Initialize sync service
        await syncService.initialize("default-user")

        // Get devices
        const deviceList = await syncService.getDevices()
        setDevices(deviceList)

        // Get current status
        const status = syncService.getStatus()
        setSyncStatus(status)

        // Load auto-sync preference
        const savedAutoSync = await syncService.getPreference<boolean>("autoSync", true)
        setAutoSync(savedAutoSync)
      } catch (error) {
        console.error("Error initializing device manager:", error)
      } finally {
        setLoading(false)
      }
    }

    init()

    // Subscribe to sync status updates
    const unsubscribe = syncService.subscribe((status) => {
      setSyncStatus(status)
      setDevices(status.devices)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Handle manual sync
  const handleSync = async () => {
    try {
      const success = await syncService.syncNow()

      if (success) {
        toast({
          title: "Sync completed",
          description: "Your preferences have been synced across devices",
        })
      } else {
        toast({
          title: "Sync failed",
          description: syncStatus?.error || "Failed to sync preferences",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error syncing:", error)
      toast({
        title: "Sync error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    }
  }

  // Handle device rename
  const handleRenameDevice = async () => {
    if (!newDeviceName.trim()) return

    try {
      const success = await syncService.renameDevice(newDeviceName.trim())

      if (success) {
        toast({
          title: "Device renamed",
          description: `Your device has been renamed to "${newDeviceName.trim()}"`,
        })
        setIsRenameDialogOpen(false)
      } else {
        toast({
          title: "Rename failed",
          description: "Failed to rename device",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error renaming device:", error)
      toast({
        title: "Rename error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    }
  }

  // Handle device removal
  const handleRemoveDevice = async () => {
    if (!deviceToRemove) return

    try {
      const success = await syncService.removeDevice(deviceToRemove.id)

      if (success) {
        toast({
          title: "Device removed",
          description: `"${deviceToRemove.name}" has been removed from your devices`,
        })
        setIsRemoveDialogOpen(false)
        setDeviceToRemove(null)
      } else {
        toast({
          title: "Removal failed",
          description: "Failed to remove device",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing device:", error)
      toast({
        title: "Removal error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    }
  }

  // Handle auto-sync toggle
  const handleAutoSyncToggle = async (enabled: boolean) => {
    setAutoSync(enabled)

    try {
      await syncService.setPreference("autoSync", enabled)

      toast({
        title: enabled ? "Auto-sync enabled" : "Auto-sync disabled",
        description: enabled
          ? "Your preferences will automatically sync across devices"
          : "Your preferences will only sync when you manually sync",
      })
    } catch (error) {
      console.error("Error toggling auto-sync:", error)
      toast({
        title: "Error",
        description: "Failed to update auto-sync setting",
        variant: "destructive",
      })
    }
  }

  // Get device icon based on type
  const getDeviceIcon = (device: SyncDevice) => {
    switch (device.type) {
      case "desktop":
        return <Monitor className="h-5 w-5 text-blue-500" />
      case "mobile":
        return <Smartphone className="h-5 w-5 text-green-500" />
      case "tablet":
        return <Tablet className="h-5 w-5 text-purple-500" />
      default:
        return <Laptop className="h-5 w-5 text-gray-500" />
    }
  }

  // Format last seen date
  const formatLastSeen = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    // Less than a minute
    if (diff < 60 * 1000) {
      return "Just now"
    }

    // Less than an hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000))
      return `${minutes} minute${minutes === 1 ? "" : "s"} ago`
    }

    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000))
      return `${hours} hour${hours === 1 ? "" : "s"} ago`
    }

    // More than a day
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    if (days < 30) {
      return `${days} day${days === 1 ? "" : "s"} ago`
    }

    // Just return the date
    return new Date(timestamp).toLocaleDateString()
  }

  // Check if sync is available
  const isSyncAvailable = syncStatus && syncStatus.devices.length > 0

  return (
    <div className="space-y-4">
      <Tabs defaultValue="devices">
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="settings">Sync Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Your Devices</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={loading || (syncStatus?.inProgress ?? false)}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus?.inProgress ? "animate-spin" : ""}`} />
              Sync Now
            </Button>
          </div>

          {syncStatus?.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{syncStatus.error}</AlertDescription>
            </Alert>
          )}

          {!isSyncAvailable && !loading && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Cross-device sync is not available. Your preferences will only be saved on this device.
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : devices.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CloudOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No devices found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {devices.map((device) => (
                <Card key={device.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        {getDeviceIcon(device)}
                        <CardTitle className="ml-2 text-lg">{device.name}</CardTitle>
                        {device.id === syncStatus?.currentDevice.id && <Badge className="ml-2">Current</Badge>}
                      </div>
                      <div className="flex space-x-2">
                        {device.id === syncStatus?.currentDevice.id ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setNewDeviceName(device.name)
                              setIsRenameDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeviceToRemove(device)
                              setIsRemoveDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {device.osInfo && device.browserInfo
                        ? `${device.osInfo} · ${device.browserInfo}`
                        : device.type.charAt(0).toUpperCase() + device.type.slice(1)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Last seen: {formatLastSeen(device.lastSeen)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
              <CardDescription>Configure how your preferences are synchronized across devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-sync">Automatic Sync</Label>
                  <p className="text-sm text-muted-foreground">Automatically sync preferences when changes are made</p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={autoSync}
                  onCheckedChange={handleAutoSyncToggle}
                  disabled={!isSyncAvailable}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sync Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {isSyncAvailable
                      ? syncStatus?.lastSynced
                        ? `Last synced: ${formatLastSeen(syncStatus.lastSynced)}`
                        : "Not synced yet"
                      : "Sync unavailable"}
                  </p>
                </div>
                <Badge variant={isSyncAvailable ? "default" : "outline"}>
                  {isSyncAvailable ? <Cloud className="h-3 w-3 mr-1" /> : <CloudOff className="h-3 w-3 mr-1" />}
                  {isSyncAvailable ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSync} disabled={!isSyncAvailable || (syncStatus?.inProgress ?? false)}>
                <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus?.inProgress ? "animate-spin" : ""}`} />
                Sync Now
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rename Device Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Device</DialogTitle>
            <DialogDescription>
              Enter a new name for this device. This helps you identify your devices when syncing.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="device-name">Device Name</Label>
            <Input
              id="device-name"
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
              placeholder="Enter device name"
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleRenameDevice} disabled={!newDeviceName.trim()}>
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Device Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Device</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{deviceToRemove?.name}" from your devices? This device will no longer
              sync with your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveDevice}>
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
