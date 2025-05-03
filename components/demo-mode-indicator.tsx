"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDemoMode } from "@/lib/demo-mode-context"

export function DemoModeIndicator() {
  const { isDemoMode, currentDemoRole } = useDemoMode()

  if (!isDemoMode) {
    return null
  }

  return (
    <Alert
      variant="warning"
      className="fixed bottom-4 right-4 w-auto max-w-md z-50 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/50 dark:border-yellow-800"
    >
      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertDescription className="text-yellow-800 dark:text-yellow-200">
        Demo Mode Active{currentDemoRole ? ` - Role: ${currentDemoRole}` : ""}
      </AlertDescription>
    </Alert>
  )
}
