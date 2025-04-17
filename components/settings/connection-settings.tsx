"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DatabaseConnectionSettings } from "@/components/database-connection-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ConnectionSettings() {
  const [activeTab, setActiveTab] = useState("database")
  const [mem0Settings, setMem0Settings] = useState({
    apiKey: "",
    apiUrl: "https://api.mem0.ai",
  })
  const [openAISettings, setOpenAISettings] = useState({
    apiKey: "",
  })
  const [ftpSettings, setFtpSettings] = useState({
    host: "",
    port: "21",
    username: "",
    password: "",
    rootDir: "/",
  })
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDatabaseConnect = async (settings: any) => {
    try {
      // In a real implementation, this would test the connection
      console.log("Connecting to database with settings:", settings)
      setSuccess("Database connection successful")
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to database")
      return false
    }
  }

  const handleMem0Connect = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(null)
    setError(null)

    try {
      // In a real implementation, this would test the Mem0 API connection
      console.log("Connecting to Mem0 API with settings:", mem0Settings)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Store in localStorage for demo purposes
      localStorage.setItem("mem0Settings", JSON.stringify(mem0Settings))

      setSuccess("Mem0 API connection successful")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to Mem0 API")
    }
  }

  const handleOpenAIConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(null)
    setError(null)

    try {
      // In a real implementation, this would test the OpenAI API connection
      console.log("Connecting to OpenAI API with settings:", openAISettings)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Store in localStorage for demo purposes
      localStorage.setItem("openAISettings", JSON.stringify(openAISettings))

      setSuccess("OpenAI API connection successful")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to OpenAI API")
    }
  }

  const handleFTPConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(null)
    setError(null)

    try {
      // In a real implementation, this would test the FTP connection
      console.log("Connecting to FTP server with settings:", ftpSettings)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Store in localStorage for demo purposes
      localStorage.setItem("ftpSettings", JSON.stringify(ftpSettings))

      setSuccess("FTP connection successful")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to FTP server")
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Connection Settings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="mem0">Mem0 API</TabsTrigger>
          <TabsTrigger value="openai">OpenAI</TabsTrigger>
          <TabsTrigger value="ftp">FTP Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="mt-6">
          <DatabaseConnectionSettings onConnect={handleDatabaseConnect} />
        </TabsContent>

        <TabsContent value="mem0" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Mem0 API Connection</CardTitle>
              <CardDescription>Configure your Mem0 API connection for AI memory features</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMem0Connect} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mem0-api-key">API Key</Label>
                  <Input
                    id="mem0-api-key"
                    value={mem0Settings.apiKey}
                    onChange={(e) => setMem0Settings({ ...mem0Settings, apiKey: e.target.value })}
                    placeholder="mem0_api_key_..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mem0-api-url">API URL</Label>
                  <Input
                    id="mem0-api-url"
                    value={mem0Settings.apiUrl}
                    onChange={(e) => setMem0Settings({ ...mem0Settings, apiUrl: e.target.value })}
                    placeholder="https://api.mem0.ai"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button onClick={handleMem0Connect} className="w-full">
                Connect to Mem0 API
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="openai" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>OpenAI API Connection</CardTitle>
              <CardDescription>Configure your OpenAI API connection for AI chat features</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOpenAIConnect} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-api-key">API Key</Label>
                  <Input
                    id="openai-api-key"
                    value={openAISettings.apiKey}
                    onChange={(e) => setOpenAISettings({ ...openAISettings, apiKey: e.target.value })}
                    placeholder="sk-..."
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button onClick={handleOpenAIConnect} className="w-full">
                Connect to OpenAI API
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="ftp" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>FTP Storage Connection</CardTitle>
              <CardDescription>Configure your FTP server connection for remote file storage</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFTPConnect} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ftp-host">Host</Label>
                  <Input
                    id="ftp-host"
                    value={ftpSettings.host}
                    onChange={(e) => setFtpSettings({ ...ftpSettings, host: e.target.value })}
                    placeholder="ftp.example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ftp-port">Port</Label>
                  <Input
                    id="ftp-port"
                    value={ftpSettings.port}
                    onChange={(e) => setFtpSettings({ ...ftpSettings, port: e.target.value })}
                    placeholder="21"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ftp-username">Username</Label>
                  <Input
                    id="ftp-username"
                    value={ftpSettings.username}
                    onChange={(e) => setFtpSettings({ ...ftpSettings, username: e.target.value })}
                    placeholder="username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ftp-password">Password</Label>
                  <Input
                    id="ftp-password"
                    type="password"
                    value={ftpSettings.password}
                    onChange={(e) => setFtpSettings({ ...ftpSettings, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ftp-root-dir">Root Directory</Label>
                  <Input
                    id="ftp-root-dir"
                    value={ftpSettings.rootDir}
                    onChange={(e) => setFtpSettings({ ...ftpSettings, rootDir: e.target.value })}
                    placeholder="/"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button onClick={handleFTPConnect} className="w-full">
                Connect to FTP Server
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {success && (
        <Alert variant="default" className="mt-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
