"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ConnectionSettings {
  host: string
  port: string
  database: string
  username: string
  password: string
}

interface DatabaseConnectionSettingsProps {
  onConnect: (settings: ConnectionSettings) => Promise<boolean>
  defaultSettings?: Partial<ConnectionSettings>
}

export function DatabaseConnectionSettings({ onConnect, defaultSettings = {} }: DatabaseConnectionSettingsProps) {
  const [settings, setSettings] = useState<ConnectionSettings>({
    host: defaultSettings.host || "",
    port: defaultSettings.port || "5432",
    database: defaultSettings.database || "",
    username: defaultSettings.username || "",
    password: defaultSettings.password || "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate inputs
      const requiredFields = ["host", "port", "database", "username", "password"]
      const missingFields = requiredFields.filter((field) => !settings[field as keyof ConnectionSettings])

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`)
      }

      const result = await onConnect(settings)

      if (result) {
        setSuccess(true)
      } else {
        throw new Error("Failed to connect to database")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Database Connection</CardTitle>
        <CardDescription>Configure your database connection settings</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="postgres">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="postgres">PostgreSQL</TabsTrigger>
            <TabsTrigger value="mysql" disabled>
              MySQL
            </TabsTrigger>
          </TabsList>
          <TabsContent value="postgres">
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="host">Host</Label>
                <Input id="host" name="host" value={settings.host} onChange={handleChange} placeholder="localhost" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input id="port" name="port" value={settings.port} onChange={handleChange} placeholder="5432" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="database">Database</Label>
                <Input
                  id="database"
                  name="database"
                  value={settings.database}
                  onChange={handleChange}
                  placeholder="postgres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={settings.username}
                  onChange={handleChange}
                  placeholder="postgres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={settings.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Success</AlertTitle>
                  <AlertDescription className="text-green-700">Successfully connected to the database</AlertDescription>
                </Alert>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
          {isLoading ? "Connecting..." : "Connect"}
        </Button>
      </CardFooter>
    </Card>
  )
}
