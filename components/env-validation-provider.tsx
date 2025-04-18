"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { validateEnvironmentVariables } from "@/lib/env-validator"
import { EnvValidationError } from "@/components/env-validation-error"

interface EnvValidationProviderProps {
  children: React.ReactNode
  strict?: boolean
}

export function EnvValidationProvider({ children, strict = false }: EnvValidationProviderProps) {
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateEnvironmentVariables> | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Only run validation on the client side
    const result = validateEnvironmentVariables(strict)
    setValidationResult(result)

    // Check if the user has previously dismissed this specific set of warnings
    const storedDismissal = localStorage.getItem("env-validation-dismissed")
    if (storedDismissal) {
      try {
        const dismissalData = JSON.parse(storedDismissal)
        const missingVarNames = result.missingVars
          .map((v) => v.name)
          .sort()
          .join(",")
        const warningNames = result.warnings
          .map((w) => w.name)
          .sort()
          .join(",")

        // Only consider it dismissed if the exact same issues were dismissed before
        if (
          dismissalData.missingVars === missingVarNames &&
          dismissalData.warnings === warningNames &&
          // Only keep dismissal for 24 hours
          dismissalData.timestamp > Date.now() - 86400000
        ) {
          setDismissed(true)
        } else {
          // Clear outdated dismissal
          localStorage.removeItem("env-validation-dismissed")
        }
      } catch (e) {
        // If there's an error parsing, clear the item
        localStorage.removeItem("env-validation-dismissed")
      }
    }
  }, [strict])

  const handleDismiss = () => {
    setDismissed(true)

    // Store the dismissal in localStorage
    const missingVarNames =
      validationResult?.missingVars
        .map((v) => v.name)
        .sort()
        .join(",") || ""
    const warningNames =
      validationResult?.warnings
        .map((w) => w.name)
        .sort()
        .join(",") || ""

    localStorage.setItem(
      "env-validation-dismissed",
      JSON.stringify({
        missingVars: missingVarNames,
        warnings: warningNames,
        timestamp: Date.now(),
      }),
    )
  }

  // If validation hasn't run yet, or there are no issues, or they've been dismissed, just render children
  if (!validationResult || validationResult.isValid || dismissed) {
    return <>{children}</>
  }

  // Otherwise, show the validation error above the children
  return (
    <>
      <EnvValidationError
        missingVars={validationResult.missingVars}
        warnings={validationResult.warnings}
        onDismiss={handleDismiss}
      />
      {children}
    </>
  )
}
