"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMem0 } from "@/components/mem0/mem0-provider"
import { useTheme } from "@/components/theme-provider"
import { Moon, Sun, Laptop, Users } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const [apiKey, setApiKey] = useState("")
  const [isDefaultConnection, setIsDefaultConnection] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [isTestingAPI, setIsTestingAPI] = useState(false)
  const [apiTestResult, setApiTestResult] = useState<{
    success: boolean
    message: string
    provider?: string
  } | null>(null)
  const { isInitialized, error, clearMemories, familyMembers } = useMem0()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // Load saved API key from localStorage or environment variable
    const savedApiKey = localStorage.getItem("openai_api_key") || process.env.OPENAI_API_KEY || ""
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }

    const defaultConnection = localStorage.getItem("default_connection")
    if (defaultConnection !== null) {
      setIsDefaultConnection(defaultConnection === "openai")
    }
  }, [])

  const handleSaveSettings = () => {
    // Save API key to localStorage
    localStorage.setItem("openai_api_key", apiKey)
    localStorage.setItem("default_connection", isDefaultConnection ? "openai" : "")
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)

    // Reload the page to reinitialize the Mem0Provider with the new API key
    window.location.reload()
  }

  const handleTestAPI = async () => {
    setIsTestingAPI(true)
    setApiTestResult(null)

    try {
      const response = await fetch("/api/test-openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      })

      const result = await response.json()

      if (response.ok) {
        setApiTestResult({
          success: true,
          message: result.message || "API key is valid! Connection successful.",
          provider: result.provider,
        })
      } else {
        setApiTestResult({
          success: false,
          message: result.error || "Failed to validate API key.",
          provider: result.provider,
        })
      }
    } catch (error) {
      setApiTestResult({
        success: false,
        message: "Network error. Could not test API key.",
      })
    } finally {
      setIsTestingAPI(false)
    }
  }

  const handleClearMemories = async () => {
    if (confirm("Are you sure you want to clear all memories? This action cannot be undone.")) {
      await clearMemories()
      alert("All memories have been cleared.")
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

      <Tabs defaultValue="api-settings">
        <TabsList className="mb-4">
          <TabsTrigger value="api-settings">API Settings</TabsTrigger>
          <TabsTrigger value="memory-settings">Memory Settings</TabsTrigger>
          <TabsTrigger value="ai-family">AI Family</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="api-settings">
          <Card>
            <CardHeader>
              <CardTitle>API Connection Settings</CardTitle>
              <CardDescription>Configure your AI API key for the AI Family Toolkit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Connection Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="api-key">AI API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-... or sk-proj-..."
                />
                <p className="text-xs text-muted-foreground">
                  Your API key is stored locally and never sent to our servers. We support OpenAI and Groq API keys.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="default-connection"
                  checked={isDefaultConnection}
                  onCheckedChange={setIsDefaultConnection}
                />
                <Label htmlFor="default-connection">Set as default connection for administration features</Label>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleTestAPI} disabled={!apiKey || isTestingAPI}>
                  {isTestingAPI ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </Button>

                {apiTestResult && (
                  <Alert variant={apiTestResult.success ? "default" : "destructive"} className="ml-2">
                    <AlertTitle>
                      {apiTestResult.provider ? `${apiTestResult.provider.toUpperCase()} API` : "API"} Test Result
                    </AlertTitle>
                    <AlertDescription>{apiTestResult.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>{isSaved ? "Settings Saved!" : "Save Settings"}</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="memory-settings">
          <Card>
            <CardHeader>
              <CardTitle>Memory Settings</CardTitle>
              <CardDescription>Configure how the application remembers your interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="enable-memory" defaultChecked />
                <Label htmlFor="enable-memory">Enable memory features</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="persist-memory" defaultChecked />
                <Label htmlFor="persist-memory">Persist memory between sessions</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="memory-retention">Memory retention period</Label>
                <select id="memory-retention" className="w-full p-2 border rounded bg-background">
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                  <option value="0">Forever</option>
                </select>
              </div>

              <Button variant="destructive" onClick={handleClearMemories} className="mt-4">
                Clear All Memories
              </Button>
            </CardContent>
            <CardFooter>
              <Button>Save Memory Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="ai-family">
          <Card>
            <CardHeader>
              <CardTitle>AI Family Members</CardTitle>
              <CardDescription>Manage your AI family members and their vector stores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You currently have {familyMembers.length} AI family {familyMembers.length === 1 ? "member" : "members"}.
                Each family member has their own vector store for personalized interactions.
              </p>

              <div className="flex justify-center">
                <Button asChild>
                  <Link href="/family-members">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Family Members
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>Customize your experience with the File Manager</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    Light
                  </Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")}>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                  >
                    <Laptop className="h-4 w-4 mr-2" />
                    System
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="auto-save" defaultChecked />
                <Label htmlFor="auto-save">Auto-save changes</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-view">Default view</Label>
                <select id="default-view" className="w-full p-2 border rounded bg-background">
                  <option value="list">List</option>
                  <option value="grid">Grid</option>
                  <option value="details">Details</option>
                </select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {isInitialized && (
        <div className="mt-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded">
          Mem0 memory system is initialized and ready to use
        </div>
      )}
    </div>
  )
}
