"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, RefreshCw, AlertTriangle, Check } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Mem0DiagnosticsPage() {
  const [apiUrl, setApiUrl] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [testResults, setTestResults] = useState<{
    baseConnection: boolean | null
    healthEndpoint: boolean | null
    memoriesEndpoint: boolean | null
    searchEndpoint: boolean | null
    addEndpoint: boolean | null
  }>({
    baseConnection: null,
    healthEndpoint: null,
    memoriesEndpoint: null,
    searchEndpoint: null,
    addEndpoint: null,
  })

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  const runDiagnostics = async () => {
    if (!apiUrl || !apiKey) {
      addLog("ERROR: API URL and API Key are required")
      return
    }

    setIsRunning(true)
    setLogs([])
    setTestResults({
      baseConnection: null,
      healthEndpoint: null,
      memoriesEndpoint: null,
      searchEndpoint: null,
      addEndpoint: null,
    })

    addLog(`Starting Mem0 API diagnostics for ${apiUrl}`)

    // Format the base URL correctly
    const baseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl
    addLog(`Formatted base URL: ${baseUrl}`)

    // Test 1: Basic connection to the base URL
    try {
      addLog("Testing basic connection to base URL...")
      const response = await fetch(baseUrl, {
        method: "HEAD",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      })

      addLog(`Base URL response: ${response.status} ${response.statusText}`)

      // Even a 401 or 403 would indicate the API exists
      if (response.ok || response.status === 401 || response.status === 403) {
        addLog("✅ Base URL connection successful")
        setTestResults((prev) => ({ ...prev, baseConnection: true }))
      } else {
        addLog("❌ Base URL connection failed")
        setTestResults((prev) => ({ ...prev, baseConnection: false }))
      }
    } catch (error) {
      addLog(`❌ Base URL connection error: ${error instanceof Error ? error.message : String(error)}`)
      setTestResults((prev) => ({ ...prev, baseConnection: false }))
    }

    // Test 2: Health endpoint
    const healthEndpoints = [`${baseUrl}/api/health`, `${baseUrl}/health`, `${baseUrl}/api/status`, `${baseUrl}/status`]

    let healthSuccess = false
    for (const endpoint of healthEndpoints) {
      try {
        addLog(`Testing health endpoint: ${endpoint}`)
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          signal: AbortSignal.timeout(3000),
        })

        addLog(`Health endpoint response: ${response.status} ${response.statusText}`)

        if (response.ok) {
          addLog(`✅ Health endpoint successful: ${endpoint}`)
          healthSuccess = true
          break
        }
      } catch (error) {
        addLog(`Health endpoint error: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    setTestResults((prev) => ({ ...prev, healthEndpoint: healthSuccess }))
    if (!healthSuccess) {
      addLog("❌ All health endpoints failed")
    }

    // Test 3: Memories endpoint
    const memoriesEndpoints = [`${baseUrl}/memories`, `${baseUrl}/api/memory/list`]

    let memoriesSuccess = false
    for (const endpoint of memoriesEndpoints) {
      try {
        addLog(`Testing memories endpoint: ${endpoint}`)
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          signal: AbortSignal.timeout(3000),
        })

        addLog(`Memories endpoint response: ${response.status} ${response.statusText}`)

        if (response.ok || response.status === 401 || response.status === 403) {
          addLog(`✅ Memories endpoint exists: ${endpoint}`)
          memoriesSuccess = true
          break
        }
      } catch (error) {
        addLog(`Memories endpoint error: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    setTestResults((prev) => ({ ...prev, memoriesEndpoint: memoriesSuccess }))
    if (!memoriesSuccess) {
      addLog("❌ All memories endpoints failed")
    }

    // Test 4: Search endpoint
    const searchEndpoints = [`${baseUrl}/search`, `${baseUrl}/api/memory/search`]

    let searchSuccess = false
    for (const endpoint of searchEndpoints) {
      try {
        addLog(`Testing search endpoint: ${endpoint}`)
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            user_id: "test_user",
            query: "test",
          }),
          signal: AbortSignal.timeout(3000),
        })

        addLog(`Search endpoint response: ${response.status} ${response.statusText}`)

        if (response.ok || response.status === 401 || response.status === 403) {
          addLog(`✅ Search endpoint exists: ${endpoint}`)
          searchSuccess = true
          break
        }
      } catch (error) {
        addLog(`Search endpoint error: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    setTestResults((prev) => ({ ...prev, searchEndpoint: searchSuccess }))
    if (!searchSuccess) {
      addLog("❌ All search endpoints failed")
    }

    // Test 5: Add memory endpoint
    const addEndpoints = [`${baseUrl}/memories`, `${baseUrl}/api/memory/add`]

    let addSuccess = false
    for (const endpoint of addEndpoints) {
      try {
        addLog(`Testing add memory endpoint: ${endpoint}`)
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            user_id: "test_user",
            text: "Test memory",
            memory: "Test memory",
          }),
          signal: AbortSignal.timeout(3000),
        })

        addLog(`Add memory endpoint response: ${response.status} ${response.statusText}`)

        if (response.ok || response.status === 401 || response.status === 403) {
          addLog(`✅ Add memory endpoint exists: ${endpoint}`)
          addSuccess = true
          break
        }
      } catch (error) {
        addLog(`Add memory endpoint error: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    setTestResults((prev) => ({ ...prev, addEndpoint: addSuccess }))
    if (!addSuccess) {
      addLog("❌ All add memory endpoints failed")
    }

    // Final assessment
    const overallSuccess = testResults.baseConnection || (testResults.memoriesEndpoint && testResults.searchEndpoint)

    if (overallSuccess) {
      addLog("✅ OVERALL ASSESSMENT: Mem0 API appears to be accessible")
    } else {
      addLog("❌ OVERALL ASSESSMENT: Mem0 API connection failed")
      addLog("Please check your API URL and API Key")
    }

    setIsRunning(false)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/mem0/settings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mem0 Settings
          </Link>
        </Button>
        <h1 className="mb-2 text-3xl font-bold">Mem0 Connection Diagnostics</h1>
        <p className="text-lg text-muted-foreground">Troubleshoot your Mem0 API connection</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Connection Settings</CardTitle>
            <CardDescription>Enter your Mem0 API credentials to run diagnostics</CardDescription>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Your Mem0 API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={runDiagnostics} disabled={isRunning || !apiUrl || !apiKey} className="w-full">
              {isRunning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Running Diagnostics...
                </>
              ) : (
                "Run Diagnostics"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Results</CardTitle>
            <CardDescription>Test results for your Mem0 API connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Base URL Connection</span>
                {testResults.baseConnection === null ? (
                  <Badge variant="outline">Not Tested</Badge>
                ) : testResults.baseConnection ? (
                  <Badge
                    variant="success"
                    className="flex items-center gap-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                  >
                    <Check className="h-3 w-3" />
                    Success
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Failed
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>Health Endpoint</span>
                {testResults.healthEndpoint === null ? (
                  <Badge variant="outline">Not Tested</Badge>
                ) : testResults.healthEndpoint ? (
                  <Badge
                    variant="success"
                    className="flex items-center gap-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                  >
                    <Check className="h-3 w-3" />
                    Success
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Failed
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>Memories Endpoint</span>
                {testResults.memoriesEndpoint === null ? (
                  <Badge variant="outline">Not Tested</Badge>
                ) : testResults.memoriesEndpoint ? (
                  <Badge
                    variant="success"
                    className="flex items-center gap-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                  >
                    <Check className="h-3 w-3" />
                    Success
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Failed
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>Search Endpoint</span>
                {testResults.searchEndpoint === null ? (
                  <Badge variant="outline">Not Tested</Badge>
                ) : testResults.searchEndpoint ? (
                  <Badge
                    variant="success"
                    className="flex items-center gap-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                  >
                    <Check className="h-3 w-3" />
                    Success
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Failed
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>Add Memory Endpoint</span>
                {testResults.addEndpoint === null ? (
                  <Badge variant="outline">Not Tested</Badge>
                ) : testResults.addEndpoint ? (
                  <Badge
                    variant="success"
                    className="flex items-center gap-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                  >
                    <Check className="h-3 w-3" />
                    Success
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Failed
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-2 text-sm font-medium">Overall Status</h3>
              {isRunning ? (
                <Alert className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <AlertTitle>Running Diagnostics</AlertTitle>
                  <AlertDescription>Please wait while we test your Mem0 API connection...</AlertDescription>
                </Alert>
              ) : logs.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Not Tested</AlertTitle>
                  <AlertDescription>Click "Run Diagnostics" to test your Mem0 API connection.</AlertDescription>
                </Alert>
              ) : testResults.baseConnection || (testResults.memoriesEndpoint && testResults.searchEndpoint) ? (
                <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Connection Successful</AlertTitle>
                  <AlertDescription>
                    Your Mem0 API connection appears to be working. You can now use Mem0 for memory storage.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Connection Failed</AlertTitle>
                  <AlertDescription>
                    Your Mem0 API connection failed. Please check the logs below for details.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Diagnostic Logs</CardTitle>
            <CardDescription>Detailed logs of the connection tests</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              {logs.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No logs available. Run diagnostics to see detailed logs.
                </div>
              ) : (
                <pre className="text-xs font-mono">{logs.join("\n")}</pre>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              These logs can help diagnose connection issues with your Mem0 API.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
