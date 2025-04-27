"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Save } from "lucide-react"

export function SettingsContent() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  // Terminal settings
  const [terminalFontSize, setTerminalFontSize] = useState("14")
  const [darkMode, setDarkMode] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  // Server settings
  const [serverLocation, setServerLocation] = useState("germany")

  const handleSaveSettings = () => {
    setIsLoading(true)

    // Simulate saving settings
    setTimeout(() => {
      setSuccess("Settings saved successfully")
      setIsLoading(false)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    }, 1000)
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="terminal">Terminal</TabsTrigger>
            <TabsTrigger value="server">Server</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage your account and application preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue={user?.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={user?.email} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
                  <Label htmlFor="auto-save">Auto-save files</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="terminal">
            <Card>
              <CardHeader>
                <CardTitle>Terminal Settings</CardTitle>
                <CardDescription>Customize your terminal experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size (px)</Label>
                  <Input
                    id="font-size"
                    type="number"
                    value={terminalFontSize}
                    onChange={(e) => setTerminalFontSize(e.target.value)}
                    min="10"
                    max="24"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Terminal Theme</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="justify-start bg-black text-green-400 hover:text-green-400 hover:bg-black/90"
                    >
                      Classic
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start bg-blue-900 text-white hover:text-white hover:bg-blue-900/90"
                    >
                      Blue
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start bg-gray-900 text-gray-300 hover:text-gray-300 hover:bg-gray-900/90"
                    >
                      Dark
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start bg-white text-black border hover:text-black hover:bg-white/90"
                    >
                      Light
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="server">
            <Card>
              <CardHeader>
                <CardTitle>Server Settings</CardTitle>
                <CardDescription>Configure server and deployment options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="server-location">Server Location</Label>
                  <select
                    id="server-location"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={serverLocation}
                    onChange={(e) => setServerLocation(e.target.value)}
                  >
                    <option value="germany">Germany (Düsseldorf)</option>
                    <option value="usa">United States</option>
                    <option value="singapore">Singapore</option>
                    <option value="australia">Australia</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="container-timeout">Container Timeout (minutes)</Label>
                  <Input id="container-timeout" type="number" defaultValue="30" min="5" max="120" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="https" defaultChecked />
                  <Label htmlFor="https">Enable HTTPS</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
