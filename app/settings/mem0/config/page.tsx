"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Database, Save, RefreshCw, Settings, HardDrive } from "lucide-react"
import { memoryStore } from "@/lib/memory-store"
import { toast } from "@/components/ui/use-toast"

export default function MemoryConfigPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [enableCompression, setEnableCompression] = useState(false)
  const [enableEncryption, setEnableEncryption] = useState(false)
  const [maxMemorySize, setMaxMemorySize] = useState(100)
  const [memoryRetention, setMemoryRetention] = useState(30)
  const [isClient, setIsClient] = useState(false)

  // Initialize state from memory store on client-side only
  useEffect(() => {
    setIsClient(true)
    setEnableCompression(memoryStore.isCompressionEnabled())
    setEnableEncryption(memoryStore.isEncryptionEnabled())
    setMaxMemorySize(memoryStore.getMaxMemorySize() || 100)
    setMemoryRetention(memoryStore.getMemoryRetention() || 30)
  }, [])

  // Save configuration
  const saveConfig = async () => {
    setSaving(true)

    try {
      // Update memory store configuration
      memoryStore.setMaxMemorySize(maxMemorySize)
      memoryStore.setMemoryRetention(memoryRetention)
      memoryStore.setCompressionEnabled(enableCompression)
      memoryStore.setEncryptionEnabled(enableEncryption)

      // Save configuration to persistent storage
      await memoryStore.saveConfig()

      toast({
        title: "Configuration saved",
        description: "Memory configuration has been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving configuration:", error)
      toast({
        title: "Error saving configuration",
        description: "An error occurred while saving the configuration.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Reset configuration to defaults
  const resetConfig = () => {
    if (confirm("Are you sure you want to reset all settings to defaults? This cannot be undone.")) {
      setMaxMemorySize(100)
      setMemoryRetention(30)
      setEnableCompression(false)
      setEnableEncryption(false)

      toast({
        title: "Configuration reset",
        description: "Memory configuration has been reset to defaults.",
      })
    }
  }

  // Clear all memories
  const clearAllMemories = async () => {
    if (confirm("Are you sure you want to clear all memory data? This cannot be undone.")) {
      try {
        await memoryStore.clearMemory()
        toast({
          title: "Memory cleared",
          description: "All memory data has been cleared.",
        })
      } catch (error) {
        console.error("Error clearing memory:", error)
        toast({
          title: "Error clearing memory",
          description: "An error occurred while clearing memory data.",
          variant: "destructive",
        })
      }
    }
  }

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push("/settings/mem0")} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Mem0 Settings
        </Button>
        <h1 className="text-3xl font-bold flex items-center">
          <Database className="h-8 w-8 mr-2 text-primary" />
          Memory Configuration
        </h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            General Settings
          </CardTitle>
          <CardDescription>Configure general memory settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="memory-retention">Memory Retention (Days)</Label>
              <Input
                id="memory-retention"
                type="number"
                min={1}
                max={365}
                value={memoryRetention}
                onChange={(e) => setMemoryRetention(Number.parseInt(e.target.value))}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                How long to keep memories before they expire. Set to 0 for no expiration.
              </p>
            </div>

            <div>
              <Label htmlFor="max-memory-size">Maximum Memory Size (MB)</Label>
              <Input
                id="max-memory-size"
                type="number"
                min={10}
                max={1000}
                step={10}
                value={maxMemorySize}
                onChange={(e) => setMaxMemorySize(Number.parseInt(e.target.value))}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Maximum size of memory storage in megabytes. Older memories will be removed when this limit is reached.
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-compression">Enable Compression</Label>
                <p className="text-sm text-muted-foreground">Compress memory data to save storage space.</p>
              </div>
              <Switch id="enable-compression" checked={enableCompression} onCheckedChange={setEnableCompression} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-encryption">Enable Encryption</Label>
                <p className="text-sm text-muted-foreground">Encrypt memory data for added security.</p>
              </div>
              <Switch id="enable-encryption" checked={enableEncryption} onCheckedChange={setEnableEncryption} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={resetConfig}>
            Reset to Defaults
          </Button>
          <Button onClick={saveConfig} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="h-5 w-5 mr-2" />
            Storage Actions
          </CardTitle>
          <CardDescription>Manage your memory data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              The following actions will affect your memory data. Make sure you understand the consequences before
              proceeding.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Data Management</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={clearAllMemories}>
                  Clear All Memories
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Export not available",
                      description: "Memory export functionality is not available in this version.",
                    })
                  }}
                >
                  Export Memories
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Import not available",
                      description: "Memory import functionality is not available in this version.",
                    })
                  }}
                >
                  Import Memories
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
