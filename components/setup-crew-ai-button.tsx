"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface MigrationResult {
  name: string
  success: boolean
  error?: string
  executionTime: number
}

interface SetupResponse {
  success: boolean
  message?: string
  appliedMigrations?: number
  migrations?: string[]
  error?: string
  details?: MigrationResult[]
}

export function SetupCrewAIButton() {
  const [isSettingUp, setIsSettingUp] = useState(false)
  const { toast } = useToast()

  async function setupCrewAI() {
    setIsSettingUp(true)
    try {
      const response = await fetch("/api/setup-crew-ai")
      const data: SetupResponse = await response.json()

      if (data.success) {
        if (data.appliedMigrations === 0) {
          toast({
            title: "Success",
            description: "All database migrations were already applied. The page will refresh automatically.",
          })
        } else {
          toast({
            title: "Success",
            description: `Applied ${data.appliedMigrations} database migrations. The page will refresh automatically.`,
          })
        }

        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        // If there are details about failed migrations, show them
        if (data.details && Array.isArray(data.details)) {
          const failedMigration = data.details.find((m) => !m.success)
          throw new Error(`Migration '${failedMigration?.name}' failed: ${failedMigration?.error || "Unknown error"}`)
        } else {
          throw new Error(data.error || "Failed to set up CrewAI tables")
        }
      }
    } catch (error) {
      console.error("Error setting up CrewAI:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set up CrewAI tables",
        variant: "destructive",
      })
    } finally {
      setIsSettingUp(false)
    }
  }

  return (
    <Button onClick={setupCrewAI} disabled={isSettingUp}>
      {isSettingUp ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Running Database Migrations...
        </>
      ) : (
        "Setup CrewAI Database"
      )}
    </Button>
  )
}
