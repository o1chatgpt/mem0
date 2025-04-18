"use client"

import { useState, useEffect } from "react"
import { validateEnvironmentVariables } from "@/lib/env-validator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EnvValidationError } from "@/components/env-validation-error"
import { CheckCircle, RefreshCw } from "lucide-react"

export function EnvStatusChecker() {
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateEnvironmentVariables> | null>(null)
  const [loading, setLoading] = useState(true)

  const checkEnvironment = () => {
    setLoading(true)
    // Small delay to show loading state
    setTimeout(() => {
      const result = validateEnvironmentVariables(false)
      setValidationResult(result)
      setLoading(false)
    }, 500)
  }

  useEffect(() => {
    checkEnvironment()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Environment Variables
          <Button variant="outline" size="sm" onClick={checkEnvironment} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>Check the status of required environment variables</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : validationResult?.isValid ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold">All Environment Variables Configured</h3>
            <p className="text-muted-foreground mt-2">
              Your application is properly configured with all required environment variables.
            </p>
          </div>
        ) : (
          <EnvValidationError
            missingVars={validationResult?.missingVars || []}
            warnings={validationResult?.warnings || []}
            showDismiss={false}
          />
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">Last checked: {new Date().toLocaleString()}</CardFooter>
    </Card>
  )
}
