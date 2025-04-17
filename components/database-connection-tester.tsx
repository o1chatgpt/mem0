"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"

export function DatabaseConnectionTester() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string>("")

  const testConnection = async () => {
    try {
      setStatus("loading")

      const response = await fetch("/api/db-test")
      const data = await response.json()

      if (data.success) {
        setStatus("success")
      } else {
        setStatus("error")
      }

      setMessage(data.message)
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
        <CardDescription>Test the connection to your PostgreSQL database</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "success" && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Connection Successful</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle>Connection Failed</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "idle" && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click the button below to test your database connection.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={testConnection} disabled={status === "loading"} className="w-full">
          {status === "loading" ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            "Test Connection"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
