"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Users, X } from "lucide-react"
import type { ConflictPrediction } from "@/lib/intelligent-conflict-service"

interface ConflictPredictionAlertProps {
  prediction: ConflictPrediction | null
  onDismiss: () => void
  onCoordinate: () => void
}

export function ConflictPredictionAlert({ prediction, onDismiss, onCoordinate }: ConflictPredictionAlertProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(!!prediction)
  }, [prediction])

  if (!prediction || !isVisible) return null

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss()
  }

  return (
    <Alert
      className={`
        fixed bottom-4 right-4 max-w-md z-50 shadow-lg
        ${
          prediction.likelihood > 0.7
            ? "border-red-400 bg-red-50"
            : prediction.likelihood > 0.4
              ? "border-amber-400 bg-amber-50"
              : "border-blue-400 bg-blue-50"
        }
      `}
    >
      <AlertTriangle
        className={`
        h-4 w-4
        ${
          prediction.likelihood > 0.7
            ? "text-red-500"
            : prediction.likelihood > 0.4
              ? "text-amber-500"
              : "text-blue-500"
        }
      `}
      />
      <AlertTitle className="flex items-center justify-between">
        <span>Potential Editing Conflict</span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription>
        <p className="mb-2">{prediction.reasoning}</p>

        {prediction.potentialUsers.length > 0 && (
          <div className="flex items-center text-sm mb-2">
            <Users className="h-3 w-3 mr-1" />
            <span>Potential conflicts with {prediction.potentialUsers.length} user(s)</span>
          </div>
        )}

        {prediction.suggestedAction !== "none" && (
          <div className="flex justify-end mt-2">
            {prediction.suggestedAction === "suggest-coordination" && (
              <Button size="sm" variant="outline" className="text-xs" onClick={onCoordinate}>
                Coordinate Editing
              </Button>
            )}

            {prediction.suggestedAction === "lock-section" && (
              <Button size="sm" variant="outline" className="text-xs" onClick={onCoordinate}>
                Lock Section
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
