"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ExportProgress, ImportProgress } from "@/lib/memory-export-import"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"

interface MemoryExportProgressProps {
  progress: ExportProgress
}

export function MemoryExportProgress({ progress }: MemoryExportProgressProps) {
  const [percentage, setPercentage] = useState(0)

  useEffect(() => {
    if (progress.total > 0) {
      setPercentage(Math.round((progress.processed / progress.total) * 100))
    }
  }, [progress.processed, progress.total])

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Exporting memories...</span>
        <span>
          {progress.processed} of {progress.total}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />

      {progress.status === "completed" && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Export completed</AlertTitle>
          <AlertDescription>Successfully exported {progress.processed} memories.</AlertDescription>
        </Alert>
      )}

      {progress.status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Export failed</AlertTitle>
          <AlertDescription>{progress.error || "An unknown error occurred during export."}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

interface MemoryImportProgressProps {
  progress: ImportProgress
}

export function MemoryImportProgress({ progress }: MemoryImportProgressProps) {
  const [percentage, setPercentage] = useState(0)

  useEffect(() => {
    if (progress.total > 0) {
      setPercentage(Math.round((progress.processed / progress.total) * 100))
    }
  }, [progress.processed, progress.total])

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>
          {progress.status === "validating"
            ? "Validating import file..."
            : progress.status === "importing"
              ? "Importing memories..."
              : "Import progress"}
        </span>
        <span>
          {progress.processed} of {progress.total}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />

      {progress.status === "completed" && (
        <Alert
          variant={progress.failed > 0 ? "warning" : "default"}
          className={progress.failed > 0 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}
        >
          <CheckCircle className={`h-4 w-4 ${progress.failed > 0 ? "text-amber-600" : "text-green-600"}`} />
          <AlertTitle>Import completed</AlertTitle>
          <AlertDescription>
            Successfully imported {progress.successful} memories.
            {progress.failed > 0 && ` Failed to import ${progress.failed} memories.`}
          </AlertDescription>
        </Alert>
      )}

      {progress.status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Import failed</AlertTitle>
          <AlertDescription>{progress.error || "An unknown error occurred during import."}</AlertDescription>
        </Alert>
      )}

      {progress.failedItems.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Failed imports ({progress.failedItems.length})</h4>
          <ScrollArea className="h-32 border rounded-md p-2">
            <ul className="space-y-1">
              {progress.failedItems.map((item, index) => (
                <li key={index} className="text-xs text-red-600">
                  <span className="font-medium">
                    {item.memory.id || item.memory.content?.substring(0, 20) || `Item ${index + 1}`}
                  </span>
                  : {item.error}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

export function ImportExportStatusBadge({
  status,
}: { status: "idle" | "validating" | "importing" | "exporting" | "completed" | "error" }) {
  let bgColor = "bg-gray-100"
  let textColor = "text-gray-700"
  let icon = <Clock className="h-3 w-3 mr-1" />
  let label = "Idle"

  switch (status) {
    case "validating":
    case "importing":
    case "exporting":
      bgColor = "bg-blue-100"
      textColor = "text-blue-700"
      icon = <Clock className="h-3 w-3 mr-1" />
      label = status.charAt(0).toUpperCase() + status.slice(1) + "..."
      break
    case "completed":
      bgColor = "bg-green-100"
      textColor = "text-green-700"
      icon = <CheckCircle className="h-3 w-3 mr-1" />
      label = "Completed"
      break
    case "error":
      bgColor = "bg-red-100"
      textColor = "text-red-700"
      icon = <AlertCircle className="h-3 w-3 mr-1" />
      label = "Error"
      break
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bgColor} ${textColor}`}>
      {icon}
      {label}
    </span>
  )
}
