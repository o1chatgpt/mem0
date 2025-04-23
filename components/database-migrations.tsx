"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, Database, Clock, ArrowUpCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
  const { toast } = useToast()

  // Fetch migration status
  const fetchMigrationStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/migrations/status")
      const data = await response.json()
      setMigrationStatus(data)
    } catch (error) {
      console.error("Error fetching migration status:", error)
      toast({
        title: "Error",
        description: "Failed to fetch migration status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Run migrations
  const runMigrations = async () => {
    setIsRunning(true)
    try {
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
        toast({
          title: "Error",
          description: data.error || "Failed to apply migrations",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error running migrations:", error)
      toast({
        title: "Error",
        description: "Failed to run migrations",
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
