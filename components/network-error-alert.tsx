"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface NetworkErrorAlertProps {
  onRetry: () => Promise<void>
}

export function NetworkErrorAlert({ onRetry }: NetworkErrorAlertProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Network Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>Failed to connect to the server. Please check your internet connection.</p>
        <Button variant="outline" size="sm" onClick={() => onRetry()} className="w-fit">
          Retry Connection
        </Button>
      </AlertDescription>
    </Alert>
  )
}
