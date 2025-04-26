"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DatabaseMigrations } from "@/components/database-migrations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default function DatabasePage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if the migrations table exists
    async function checkMigrationsTable() {
      try {
        const response = await fetch("/api/migrations/status")
        const data = await response.json()

        if (!data.success && data.code === "TABLE_NOT_EXIST") {
          setError(data.error)
        }
      } catch (error) {
        console.error("Error checking migrations table:", error)
        setError("Failed to check migrations table status")
      } finally {
        setIsLoading(false)
      }
    }

    checkMigrationsTable()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-2 text-3xl font-bold">Database Management</h1>
      <p className="mb-8 text-lg text-muted-foreground">Manage your database schema and migrations</p>

      {isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Checking database status...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Database Setup Required
            </CardTitle>
            <CardDescription>The migration system needs to be set up before it can be used</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <p className="mb-4">
              You need to set up the database with the required tables and functions before you can use the migration
              system.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/database/setup">Setup Database</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-8">
          <DatabaseMigrations />
        </div>
      )}
    </div>
  )
}
