"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Database, Brain, Check, AlertTriangle, RefreshCw, Save, ExternalLink } from "lucide-react"
import { checkMem0ApiConnection } from "@/lib/mem0-integration"

export default function Mem0SettingsPage() {
  const [apiKey, setApiKey] = useState("")
  const [apiUrl, setApiUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "unknown">("unknown")
  const [autoSync, setAutoSync] = useState(true)
  const [fallbackToLocal, setFallbackToLocal] = useState(true)
  const [showApiKey, setShowApiKey] = useState(false)
  const { toast } = useToast()

  // Load saved settings on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        // Load from localStorage
        const savedSettings = localStorage.getItem("mem0Settings")
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          setApiKey(settings.apiKey || "")
          setApiUrl(settings.apiUrl || "")
          setAutoSync(settings.autoSync !== false) // Default to true
          setFallbackToLocal(settings.fallbackToLocal !== false) // Default to true
        }
      } catch (error) {
        console.error("Error loading Mem0 settings:", error)
      }
    }

    loadSettings()
  }, [])

  // Save settings
  const saveSettings = () => {
    setIsLoading(true)
    try {
      // Save to localStorage
      localStorage.setItem(
        "mem0Settings",
        JSON.stringify({
          apiKey,
          apiUrl,
          autoSync,
          fallbackToLocal,
        }),
      )

      toast({
        title: "Settings Saved",
        description: "Your Mem0 API settings have been saved successfully.",
      })

      // Test connection after saving
      testConnection()
    } catch (error) {
      console.error("Error saving Mem0 settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Test connection to Mem0 API
  const testConnection = async () => {
    if (!apiKey || !apiUrl) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both API URL and API Key to test the connection.",
        variant: "destructive",
      })
      return
    }

    setIsTesting(true)
    try {
      // Use the server-side API to check connection
      const status = await checkMem0ApiConnection(apiKey, apiUrl)

      setConnectionStatus(status)

      if (status === "connected") {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to the Mem0 API.",
        })
      } else {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to the Mem0 API. Please check your API URL and API Key.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error testing Mem0 API connection:", error)
      setConnectionStatus("disconnected")
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/mem0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mem0
          </Link>
        </Button>
        <h1 className="mb-2 text-3xl font-bold">Mem0 Settings</h1>
        <p className="text-lg text-muted-foreground">Configure your Mem0 API integration</p>
      </div>

      <Tabs defaultValue="connection" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          <TabsTrigger value="about">About Mem0</TabsTrigger>
        </TabsList>

        <TabsContent value="connection">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Mem0 API Connection
                  </CardTitle>
                  <CardDescription>Configure your connection to the Mem0 API</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiUrl">API URL</Label>
                    <Input
                      id="apiUrl"
                      placeholder="https://api.mem0.ai"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      The base URL for the Mem0 API (e.g., https://api.mem0.ai)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <div className="flex">
                      <Input
                        id="apiKey"
                        type={showApiKey ? "text" : "password"}
                        placeholder="Your Mem0 API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="ml-2"
                      >
                        {showApiKey ? "Hide" : "Show"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Your Mem0 API authentication key</p>
                  </div>

                  <div className="pt-4">
                    <Button onClick={testConnection} disabled={isTesting || !apiKey || !apiUrl} className="w-full">
                      {isTesting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Testing Connection...
                        </>
                      ) : (
                        "Test Connection"
                      )}
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    <span className="text-sm font-medium mr-2">Status:</span>
                    {connectionStatus === "unknown" ? (
                      <Badge variant="outline">Unknown</Badge>
                    ) : connectionStatus === "connected" ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Disconnected
                      </Badge>
                    )}
                  </div>
                  <Button onClick={saveSettings} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Connection Status</CardTitle>
                  <CardDescription>Current status of your Mem0 integration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {connectionStatus === "connected" ? (
                    <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      <Check className="h-4 w-4" />
                      <AlertTitle>Connected to Mem0 API</AlertTitle>
                      <AlertDescription>
                        Your application is successfully connected to the Mem0 API. All memory operations will be
                        synchronized with the Mem0 cloud.
                      </AlertDescription>
                    </Alert>
                  ) : connectionStatus === "disconnected" ? (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Connection Failed</AlertTitle>
                      <AlertDescription>
                        Unable to connect to the Mem0 API. Please check your API URL and API Key. Memory operations will
                        use the local database fallback.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Connection Not Tested</AlertTitle>
                      <AlertDescription>
                        The connection to the Mem0 API has not been tested yet. Click the "Test Connection" button to
                        verify your settings.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="rounded-md border p-4">
                    <h3 className="text-sm font-medium mb-2">Storage Configuration</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Primary Storage:</span>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {connectionStatus === "connected" ? (
                            <>
                              <Brain className="h-3 w-3" />
                              Mem0 Cloud
                            </>
                          ) : (
                            <>
                              <Database className="h-3 w-3" />
                              Local Database
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Fallback Storage:</span>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          Local Database
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Auto Sync:</span>
                        <Badge
                          variant={autoSync ? "success" : "secondary"}
                          className={
                            autoSync ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300" : ""
                          }
                        >
                          {autoSync ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Memory Statistics</CardTitle>
                  <CardDescription>Statistics about your memory storage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Memories:</span>
                      <span>24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Cloud Memories:</span>
                      <span>{connectionStatus === "connected" ? "24" : "0"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Local Memories:</span>
                      <span>24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Last Sync:</span>
                      <span className="text-sm text-muted-foreground">
                        {connectionStatus === "connected" ? "2 minutes ago" : "Never"}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" disabled={connectionStatus !== "connected"}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced options for the Mem0 integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Synchronization</h3>

                <div className="flex items-center justify-between">
                  <Label htmlFor="autoSync" className="flex flex-col space-y-1">
                    <span>Automatic Synchronization</span>
                    <span className="text-xs text-muted-foreground">
                      Automatically sync memories between local storage and Mem0 cloud
                    </span>
                  </Label>
                  <Switch id="autoSync" checked={autoSync} onCheckedChange={setAutoSync} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="fallbackToLocal" className="flex flex-col space-y-1">
                    <span>Local Fallback</span>
                    <span className="text-xs text-muted-foreground">
                      Use local database when Mem0 API is unavailable
                    </span>
                  </Label>
                  <Switch id="fallbackToLocal" checked={fallbackToLocal} onCheckedChange={setFallbackToLocal} />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Memory Management</h3>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Export Memories
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Export all memories to a JSON file for backup or migration
                  </p>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Import Memories
                  </Button>
                  <p className="text-xs text-muted-foreground">Import memories from a JSON file</p>
                </div>

                <div className="space-y-2">
                  <Button variant="destructive" className="w-full">
                    Clear Local Memories
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Delete all memories stored in the local database (cannot be undone)
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Save Advanced Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Mem0</CardTitle>
              <CardDescription>Information about the Mem0 memory layer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center mb-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Mem0</h2>
                  <p className="text-muted-foreground">The Memory Layer for Personalized AI</p>
                </div>
              </div>

              <p>
                Mem0 enhances AI assistants and agents with an intelligent memory layer, enabling personalized AI
                interactions. It remembers user preferences, adapts to individual needs, and continuously improves over
                time.
              </p>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Key Features</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Long-term memory retention across sessions</li>
                  <li>Personalized AI interactions based on user history</li>
                  <li>Seamless integration with various AI models</li>
                  <li>Local and cloud storage options</li>
                  <li>Secure and private memory management</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="https://mem0.ai" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Mem0 Website
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="https://docs.mem0.ai" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Documentation
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="https://github.com/mem0ai/mem0" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      GitHub Repository
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="https://mem0.dev/DiG" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Join Discord Community
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-center text-sm text-muted-foreground">
              Mem0 is an open-source project. You can contribute on GitHub.
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
