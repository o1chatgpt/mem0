"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, Database, Clock, ArrowUpCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface MigrationStatus {
  name: string
  applied: boolean
  appliedAt?: string
}

interface MigrationStatusResponse {
  success: boolean
  migrations: MigrationStatus[]
  totalMigrations: number
  appliedMigrations: number
  pendingMigrations: number
  needsSetup?: boolean
  message?: string
  error?: string
}

interface RunMigrationsResponse {
  success: boolean
  message?: string
  appliedMigrations?: number
  migrations?: string[]
  error?: string
  details?: any
}

export function DatabaseMigrations() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatusResponse | null>(null)
  const [needsSetup, setNeedsSetup] = useState(false)
  const { toast } = useToast()

  // Fetch migration status
  const fetchMigrationStatus = async () => {
    setIsLoading(true)
    try {
      console.log("Fetching migration status...")

      // Use a try-catch block for the fetch operation
      let response
      try {
        response = await fetch("/api/migrations/status")
      } catch (fetchError) {
        console.error("Network error fetching migration status:", fetchError)
        throw new Error("Network error. Please check your connection and try again.")
      }

      // Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API returned status ${response.status}:`, errorText)
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      // Parse the JSON response
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError)
        throw new Error("Invalid response format from server")
      }

      console.log("Migration status response:", data)

      // Check if setup is needed
      if (data.needsSetup) {
        console.log("Database setup is needed")
        setNeedsSetup(true)
      } else {
        setNeedsSetup(false)
      }

      setMigrationStatus(data)
    } catch (error) {
      console.error("Error fetching migration status:", error)

      // Set needsSetup to true to show the setup UI
      setNeedsSetup(true)

      toast({
        title: "Database Setup Required",
        description: "The database needs to be set up before migrations can be managed.",
        variant: "default",
      })

      // Set a default migration status to avoid null errors
      setMigrationStatus({
        success: false,
        migrations: [],
        totalMigrations: 0,
        appliedMigrations: 0,
        pendingMigrations: 0,
        needsSetup: true,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Run migrations
  const runMigrations = async () => {
    setIsRunning(true)
    try {
      toast({
        title: "Running Migrations",
        description: "Setting up database tables. This may take a moment...",
      })

      const response = await fetch("/api/setup-crew-ai")
      const data: RunMigrationsResponse = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Migrations applied successfully",
        })
        // Refresh migration status
        fetchMigrationStatus()
      } else {
        console.error("Migration error details:", data)
        toast({
          title: "Error",
          description: data.error || "Failed to apply migrations. Check console for details.",
          variant: "destructive",
        })

        // Show more detailed error if available
        if (data.details) {
          console.error("Migration error details:", data.details)
          if (typeof data.details === "string") {
            toast({
              title: "Error Details",
              description: data.details,
              variant: "destructive",
            })
          }
        }
      }
    } catch (error) {
      console.error("Error running migrations:", error)
      toast({
        title: "Error",
        description: "Failed to run migrations. Network error or server issue.",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  // Format migration name for display
  const formatMigrationName = (name: string) => {
    // Extract the description part after the timestamp
    const parts = name.split("_")
    if (parts.length >= 3) {
      // Join all parts after the timestamp and replace underscores with spaces
      return parts.slice(2).join("_").replace(/_/g, " ")
    }
    return name
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  // Load migration status on component mount
  useEffect(() => {
    fetchMigrationStatus()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Migrations
          </CardTitle>
          <CardDescription>Loading migration status...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  // If setup is needed, show a special card
  if (needsSetup) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Database Setup Required
          </CardTitle>
          <CardDescription>The database migrations table needs to be set up</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTitle>Database migrations table not found</AlertTitle>
            <AlertDescription>
              The database migrations table does not exist yet. This is normal if this is your first time using the
              application.
            </AlertDescription>
          </Alert>
          <p className="mb-4">Click the button below to set up the required database tables and run migrations.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={runMigrations} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting Up Database...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Setup Database
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (!migrationStatus || !migrationStatus.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Migrations
          </CardTitle>
          <CardDescription>Failed to load migration status</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{migrationStatus?.error || "An error occurred while loading migration status"}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={fetchMigrationStatus}>Retry</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Migrations
        </CardTitle>
        <CardDescription>Manage database schema migrations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Migrations</p>
              <p className="text-2xl font-bold">{migrationStatus.totalMigrations}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">Applied</p>
              <p className="text-2xl font-bold text-green-600">{migrationStatus.appliedMigrations}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{migrationStatus.pendingMigrations}</p>
            </CardContent>
          </Card>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Migration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {migrationStatus.migrations.map((migration) => (
              <TableRow key={migration.name}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{formatMigrationName(migration.name)}</span>
                    <span className="text-xs text-muted-foreground">{migration.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {migration.applied ? (
                    <Badge variant="success" className="flex w-24 items-center justify-center gap-1">
                      <Check className="h-3 w-3" /> Applied
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex w-24 items-center justify-center gap-1">
                      <Clock className="h-3 w-3" /> Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{formatDate(migration.appliedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={fetchMigrationStatus} disabled={isLoading || isRunning}>
          Refresh
        </Button>
        {migrationStatus.pendingMigrations > 0 && (
          <Button onClick={runMigrations} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Migrations...
              </>
            ) : (
              <>
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Apply Pending Migrations
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
