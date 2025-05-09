"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { MemoryProvider } from "@/components/memory-context-provider"

export default function Mem0IntegrationPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<"connected" | "disconnected" | "error">("disconnected")

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simple check to see if we can connect to the API
        const response = await fetch("/api/mem0/status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        // Handle non-JSON responses
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned non-JSON response. Please check server logs.")
        }

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to initialize Mem0 integration")
        }

        if (data.status === "connected") {
          setStatus("connected")
        } else {
          setStatus("disconnected")
          setError(data.message || "Memory system is not properly configured")
        }
      } catch (err) {
        console.error("Error initializing Mem0:", err)
        setError(err instanceof Error ? err.message : "Unknown error occurred")
        setStatus("error")
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [])

  const handleRetry = () => {
    setIsLoading(true)
    setError(null)
    // Re-run the initialization
    window.location.reload()
  }

  return (
    <MemoryProvider>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold">Mem0 Integration</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Memory System Status</CardTitle>
            <CardDescription>Connect to the Mem0 memory system to enable AI-powered memory features.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-1/4" />
              </div>
            ) : error ? (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div
                    className={`h-3 w-3 rounded-full mr-2 ${status === "connected" ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span>
                    Status: <strong>{status === "connected" ? "Connected" : "Disconnected"}</strong>
                  </span>
                </div>
                <p>
                  {status === "connected"
                    ? "Your memory system is properly configured and ready to use."
                    : "There was an issue connecting to the memory system."}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {(error || status === "disconnected") && (
              <Button onClick={handleRetry} disabled={isLoading} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                {isLoading ? "Retrying..." : "Retry Connection"}
              </Button>
            )}
          </CardFooter>
        </Card>

        {status === "connected" && !isLoading && !error && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Memory Categories</CardTitle>
                <CardDescription>Manage how your memories are organized.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Memory categories help you organize and filter your memories. You can create custom categories or use
                  the default ones.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/memory-categories">
                  <Button>Manage Categories</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Analytics</CardTitle>
                <CardDescription>View insights about your memory usage.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Memory analytics provide insights into how your memory system is being used, including usage patterns
                  and growth trends.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/memory-analytics">
                  <Button>View Analytics</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </MemoryProvider>
  )
}
