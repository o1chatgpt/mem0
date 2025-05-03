"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Server, Save, RefreshCw, Globe } from "lucide-react"
import { memoryStore } from "@/lib/memory-store"
import { toast } from "@/components/ui/use-toast"

export default function ApiSettingsPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [apiEndpoint, setApiEndpoint] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "unknown">("unknown")
  const [isClient, setIsClient] = useState(false)

  // Initialize state from memory store on client-side only
  useEffect(() => {
    setIsClient(true)
    setApiEndpoint(memoryStore.getApiEndpoint() || "")
    setApiKey(memoryStore.getApiKey() || "")
  }, [])

  // Check API connection
  const checkConnection = async () => {
    if (!apiEndpoint || !apiKey) {
      toast({
        title: "Missing information",
        description: "Please enter both API endpoint and API key.",
        variant: "destructive",
      })
      return
    }

    try {
      const success = await memoryStore.testApiConnection(apiEndpoint, apiKey)

      if (success) {
        setConnectionStatus("connected")
        toast({
          title: "Connection successful",
          description: "Successfully connected to the Mem0 API.",
        })
      } else {
        setConnectionStatus("disconnected")
        toast({
          title: "Connection failed",
          description: "Failed to connect to the Mem0 API. Please check your endpoint and API key.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error checking connection:", error)
      setConnectionStatus("disconnected")
      toast({
        title: "Connection error",
        description: "An error occurred while checking the API connection.",
        variant: "destructive",
      })
    }
  }

  // Save API settings
  const saveSettings = async () => {
    setSaving(true)

    try {
      // Update memory store API settings
      memoryStore.setApiEndpoint(apiEndpoint)
      memoryStore.setApiKey(apiKey)

      // Save settings to persistent storage
      await memoryStore.saveConfig()

      toast({
        title: "Settings saved",
        description: "API settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving API settings:", error)
      toast({
        title: "Error saving settings",
        description: "An error occurred while saving the API settings.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Reset API settings
  const resetSettings = () => {
    if (confirm("Are you sure you want to reset all API settings to defaults? This cannot be undone.")) {
      setApiEndpoint("")
      setApiKey("")
      setConnectionStatus("unknown")

      toast({
        title: "Settings reset",
        description: "API settings have been reset to defaults.",
      })
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
          <Server className="h-8 w-8 mr-2 text-primary" />
          API Settings
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Connection Settings
          </CardTitle>
          <CardDescription>Configure connection to the Mem0 API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {connectionStatus !== "unknown" && (
            <Alert variant={connectionStatus === "connected" ? "success" : "destructive"} className="mb-4">
              <AlertTitle>{connectionStatus === "connected" ? "Connected to API" : "Not Connected to API"}</AlertTitle>
              <AlertDescription>
                {connectionStatus === "connected"
                  ? "Successfully connected to the Mem0 API."
                  : "Failed to connect to the Mem0 API. Please check your endpoint and API key."}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="api-endpoint">API Endpoint</Label>
              <Input
                id="api-endpoint"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                placeholder="https://api.mem0.ai/v1"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">The URL of the Mem0 API endpoint.</p>
            </div>

            <div>
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Mem0 API key"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">Your Mem0 API key for authentication.</p>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={checkConnection} disabled={!apiEndpoint || !apiKey}>
                Test Connection
              </Button>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">Security Recommendations</h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li>Keep your API key secure and never share it publicly.</li>
                <li>Rotate your API key regularly for enhanced security.</li>
                <li>Use environment variables to store your API key in production.</li>
                <li>Set appropriate permissions for your API key in the Mem0 dashboard.</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={resetSettings}>
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
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
    </div>
  )
}
