"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Brain, Database, AlertCircle, Check, RefreshCw } from "lucide-react"
import { checkMem0ApiConnection } from "@/lib/mem0-integration"
import Link from "next/link"

export function Mem0ConnectionDetails() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "checking">("checking")
  const [isRetrying, setIsRetrying] = useState(false)
  const [settings, setSettings] = useState<{
    apiKey: string
    apiUrl: string
    autoSync: boolean
    fallbackToLocal: boolean
  } | null>(null)

  const checkStatus = async () => {
    try {
      setStatus("checking")
      setIsRetrying(true)

      // Check if settings exist in localStorage
      const savedSettings = localStorage.getItem("mem0Settings")
      if (!savedSettings) {
        setStatus("disconnected")
        setIsRetrying(false)
        return
      }

      // Get settings from localStorage
      const parsedSettings = JSON.parse(savedSettings)
      setSettings(parsedSettings)

      const apiKey = parsedSettings.apiKey
      const apiUrl = parsedSettings.apiUrl

      if (!apiKey || !apiUrl) {
        setStatus("disconnected")
        setIsRetrying(false)
        return
      }

      // Check connection with custom credentials
      const apiStatus = await checkMem0ApiConnection(apiKey, apiUrl)
      setStatus(apiStatus)
    } catch (error) {
      console.error("Error checking Mem0 status:", error)
      setStatus("disconnected")
    } finally {
      setIsRetrying(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Mem0 Connection Status
        </CardTitle>
        <CardDescription>Current status of your Mem0 integration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "checking" || isRetrying ? (
          <Alert className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertTitle>Checking Connection</AlertTitle>
            <AlertDescription>Verifying connection to the Mem0 API...</AlertDescription>
          </Alert>
        ) : status === "connected" ? (
          <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            <Check className="h-4 w-4" />
            <AlertTitle>Connected to Mem0 API</AlertTitle>
            <AlertDescription>
              Your application is successfully connected to the Mem0 API. All memory operations will be synchronized
              with the Mem0 cloud.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Failed</AlertTitle>
            <AlertDescription>
              Unable to connect to the Mem0 API. Please check your API URL and API Key. Memory operations will use the
              local database fallback.
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Connection Details</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">API URL:</span>
              <span className="text-sm font-mono truncate max-w-[200px]">{settings?.apiUrl || "Not configured"}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">API Key:</span>
              <span className="text-sm font-mono">
                {settings?.apiKey
                  ? `${settings.apiKey.substring(0, 4)}...${settings.apiKey.substring(settings.apiKey.length - 4)}`
                  : "Not configured"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Auto Sync:</span>
              <Badge variant={settings?.autoSync ? "outline" : "secondary"}>
                {settings?.autoSync ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Local Fallback:</span>
              <Badge variant={settings?.fallbackToLocal ? "outline" : "secondary"}>
                {settings?.fallbackToLocal ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Current Storage:</span>
              <Badge variant="outline" className="flex items-center gap-1">
                {status === "connected" ? (
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
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={checkStatus} disabled={isRetrying}>
          {isRetrying ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            "Refresh Status"
          )}
        </Button>

        <Button asChild variant="outline" size="sm">
          <Link href="/mem0/settings/diagnostics">Run Diagnostics</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
