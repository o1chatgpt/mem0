"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Database, RefreshCw } from "lucide-react"

export function DatabaseSetup() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string>("")

  const setupDatabase = async () => {
    try {
      setStatus("loading")

      const response = await fetch("/api/setup-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

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
        <CardTitle>Database Setup</CardTitle>
        <CardDescription>Create all required tables in your PostgreSQL database</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "success" && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Setup Successful</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle>Setup Failed</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "idle" && (
          <div className="flex flex-col items-center justify-center py-4">
            <Database className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              This will create all the necessary tables in your database.
              <br />
              <br />
              <strong>Warning:</strong> If tables already exist, this operation will not overwrite them.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={setupDatabase} disabled={status === "loading"} className="w-full">
          {status === "loading" ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Setting Up Database...
            </>
          ) : (
            "Setup Database"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
