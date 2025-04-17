"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Users, X } from "lucide-react"
import type { ConflictPrediction } from "@/lib/intelligent-conflict-service"

interface ConflictPredictionAlertProps {
  prediction: ConflictPrediction | null
  onDismiss: () => void
  onCoordinate: () => void
}

export function ConflictPredictionAlert({ prediction, onDismiss, onCoordinate }: ConflictPredictionAlertProps) {
  if (!prediction) return null

  const likelihoodPercent = Math.round(prediction.likelihood * 100)

  return (
    <Alert
      className={`mt-4 ${
        prediction.suggestedAction === "lock-section"
          ? "border-red-200 bg-red-50"
          : prediction.suggestedAction === "suggest-coordination"
            ? "border-amber-200 bg-amber-50"
            : "border-blue-200 bg-blue-50"
      }`}
    >
      <AlertTriangle
        className={`h-4 w-4 ${
          prediction.suggestedAction === "lock-section"
            ? "text-red-500"
            : prediction.suggestedAction === "suggest-coordination"
              ? "text-amber-500"
              : "text-blue-500"
        }`}
      />
      <div className="flex-1">
        <AlertTitle className="flex items-center text-sm font-medium">
          Potential Editing Conflict Detected
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto" onClick={onDismiss}>
            <X className="h-3 w-3" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </AlertTitle>
        <AlertDescription className="mt-2">
          <div className="text-sm mb-2">{prediction.reasoning}</div>

          <div className="flex items-center mb-2">
            <span className="text-xs mr-2">Conflict Likelihood:</span>
            <div className="flex-1 mr-2">
              <Progress
                value={likelihoodPercent}
                className={`h-2 ${
                  likelihoodPercent > 70 ? "bg-red-100" : likelihoodPercent > 40 ? "bg-amber-100" : "bg-blue-100"
                }`}
                indicatorClassName={
                  likelihoodPercent > 70 ? "bg-red-500" : likelihoodPercent > 40 ? "bg-amber-500" : "bg-blue-500"
                }
              />
            </div>
            <span className="text-xs font-medium">{likelihoodPercent}%</span>
          </div>

          {prediction.potentialUsers.length > 0 && (
            <div className="flex items-center text-xs mb-3">
              <Users className="h-3 w-3 mr-1" />
              <span>Potential conflicts with: {prediction.potentialUsers.join(", ")}</span>
            </div>
          )}

          {prediction.suggestedAction === "suggest-coordination" && (
            <Button size="sm" className="text-xs h-7" onClick={onCoordinate}>
              Coordinate with Other Editors
            </Button>
          )}

          {prediction.suggestedAction === "lock-section" && (
            <Button size="sm" variant="destructive" className="text-xs h-7">
              Lock Current Section
            </Button>
          )}
        </AlertDescription>
      </div>
    </Alert>
  )
}
