"use client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DatabaseConnectionErrorProps {
  onRetry?: () => void
}

export function DatabaseConnectionError({ onRetry }: DatabaseConnectionErrorProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Database Connection Error</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          Unable to connect to the database. Please check your environment variables and make sure Supabase is properly
          configured.
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry Connection
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
