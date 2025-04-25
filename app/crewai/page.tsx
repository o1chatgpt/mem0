"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { WorkflowDesigner } from "@/components/crewai/workflow-designer"
import { WorkflowList } from "@/components/crewai/workflow-list"
import { WorkflowDetail } from "@/components/crewai/workflow-detail"
import { ArrowLeft } from "lucide-react"
import type { CrewWorkflow } from "@/lib/crewai/crewai-service"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function CrewAIPage() {
  const [view, setView] = useState<"list" | "create" | "detail">("list")
  const [selectedWorkflow, setSelectedWorkflow] = useState<CrewWorkflow | null>(null)
  const userId = 1 // In a real app, this would come from authentication
  const [loading, setLoading] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const { toast } = useToast()

  // Initialize CrewAI tables
  useEffect(() => {
    const initializeTables = async () => {
      try {
        setLoading(true) // Add a loading state to the component
        setInitError(null)

        const response = await fetch("/api/crewai/init", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to initialize CrewAI tables")
        }

        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || "Unknown error initializing tables")
        }

        console.log("CrewAI tables initialized successfully")
      } catch (error) {
        console.error("Error initializing CrewAI tables:", error)
        setInitError(error instanceof Error ? error.message : "Failed to initialize CrewAI tables")
        toast({
          title: "Initialization Error",
          description: "Failed to initialize CrewAI tables. Some features may not work correctly.",
          variant: "destructive",
        })
      } finally {
        setLoading(false) // End loading state
      }
    }

    initializeTables()
  }, [])

  const handleCreateNew = () => {
    setView("create")
    setSelectedWorkflow(null)
  }

  const handleViewWorkflow = (workflow: CrewWorkflow) => {
    setSelectedWorkflow(workflow)
    setView("detail")
  }

  const handleBackToList = () => {
    setView("list")
    setSelectedWorkflow(null)
  }

  const handleWorkflowSaved = (workflow: CrewWorkflow) => {
    setSelectedWorkflow(workflow)
    setView("detail")
  }

  const handleRefreshWorkflow = async () => {
    if (!selectedWorkflow) return

    try {
      const response = await fetch(`/api/crewai/workflows/${selectedWorkflow.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch workflow")
      }

      const data = await response.json()
      setSelectedWorkflow(data.workflow)
    } catch (error) {
      console.error("Error refreshing workflow:", error)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">CrewAI Workflows</h1>
        {view === "list" && <Button onClick={handleCreateNew}>Create New Workflow</Button>}
        {view !== "list" && (
          <Button variant="outline" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workflows
          </Button>
        )}
      </div>

      {initError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Initialization Error</AlertTitle>
          <AlertDescription>{initError}</AlertDescription>
        </Alert>
      )}

      {view === "list" && (
        <WorkflowList userId={userId} onCreateNew={handleCreateNew} onViewWorkflow={handleViewWorkflow} />
      )}

      {view === "create" && <WorkflowDesigner userId={userId} onSave={handleWorkflowSaved} />}

      {view === "detail" && selectedWorkflow && (
        <WorkflowDetail workflow={selectedWorkflow} onBack={handleBackToList} onRefresh={handleRefreshWorkflow} />
      )}
    </div>
  )
}
