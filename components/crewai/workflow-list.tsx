"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import {
  Plus,
  Workflow,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Eye,
  Loader2,
  RefreshCw,
} from "lucide-react"
import type { CrewWorkflow } from "@/lib/crewai/crewai-service"

interface WorkflowListProps {
  userId: number
  onCreateNew: () => void
  onViewWorkflow: (workflow: CrewWorkflow) => void
}

export function WorkflowList({ userId, onCreateNew, onViewWorkflow }: WorkflowListProps) {
  const [workflows, setWorkflows] = useState<CrewWorkflow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch workflows
  const fetchWorkflows = async () => {
    setLoading(true)
    setError(null)
    try {
      // First, ensure tables are initialized
      try {
        const initResponse = await fetch("/api/crewai/init", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!initResponse.ok) {
          const initData = await initResponse.json()
          console.warn("Table initialization response:", initData)
        }
      } catch (initError) {
        console.error("Error during initialization:", initError)
        // Continue anyway, as the tables might already exist
      }

      // Then fetch workflows
      const response = await fetch(`/api/crewai/workflows?userId=${userId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch workflows")
      }

      const data = await response.json()
      setWorkflows(data.workflows || [])
    } catch (error) {
      console.error("Error fetching workflows:", error)
      setError(error instanceof Error ? error.message : "Failed to load workflows")
      toast({
        title: "Error",
        description: "Failed to load workflows. Database tables may not be properly initialized.",
        variant: "destructive",
      })
      setWorkflows([]) // Ensure we have an empty array even on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkflows()
  }, [userId])

  // Calculate workflow progress
  const calculateProgress = (workflow: CrewWorkflow) => {
    if (!workflow.tasks || workflow.tasks.length === 0) return 0

    const completedTasks = workflow.tasks.filter((task) => task.status === "completed").length
    return Math.round((completedTasks / workflow.tasks.length) * 100)
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      case "active":
        return <Badge className="bg-blue-500">Active</Badge>
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "waiting_approval":
        return <Badge className="bg-amber-500">Awaiting Approval</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Start workflow
  const startWorkflow = async (workflowId: string) => {
    setActionInProgress(workflowId)
    try {
      const response = await fetch(`/api/crewai/workflows/${workflowId}/start`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to start workflow")
      }

      toast({
        title: "Workflow Started",
        description: "The workflow has been started successfully",
      })

      // Refresh workflows
      fetchWorkflows()
    } catch (error) {
      console.error("Error starting workflow:", error)
      toast({
        title: "Error",
        description: "Failed to start workflow",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(null)
    }
  }

  // Pause workflow
  const pauseWorkflow = async (workflowId: string) => {
    setActionInProgress(workflowId)
    try {
      const response = await fetch(`/api/crewai/workflows/${workflowId}/pause`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to pause workflow")
      }

      toast({
        title: "Workflow Paused",
        description: "The workflow has been paused successfully",
      })

      // Refresh workflows
      fetchWorkflows()
    } catch (error) {
      console.error("Error pausing workflow:", error)
      toast({
        title: "Error",
        description: "Failed to pause workflow",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(null)
    }
  }

  // Submit workflow for approval
  const submitForApproval = async (workflowId: string) => {
    setActionInProgress(workflowId)
    try {
      const response = await fetch(`/api/crewai/workflows/${workflowId}/submit`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to submit workflow for approval")
      }

      toast({
        title: "Workflow Submitted",
        description: "The workflow has been submitted for approval",
      })

      // Refresh workflows
      fetchWorkflows()
    } catch (error) {
      console.error("Error submitting workflow:", error)
      toast({
        title: "Error",
        description: "Failed to submit workflow for approval",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(null)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Workflow className="mr-2 h-5 w-5" />
              Your Workflows
            </CardTitle>
            <CardDescription>Manage your custom AI workflows</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={fetchWorkflows} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-8 border rounded-md">
            <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">You haven't created any workflows yet</p>
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Workflow
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {workflow.name}
                        <span className="ml-2">{getStatusBadge(workflow.status)}</span>
                      </CardTitle>
                      <CardDescription>{workflow.description || "No description provided"}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => onViewWorkflow(workflow)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{calculateProgress(workflow)}%</span>
                    </div>
                    <Progress value={calculateProgress(workflow)} className="h-2" />

                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        Created: {new Date(workflow.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Tasks: {workflow.tasks.filter((t) => t.status === "completed").length}/{workflow.tasks.length}
                      </div>
                      {workflow.requires_approval && (
                        <div className="flex items-center text-sm text-amber-500">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Requires Approval
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-4 flex justify-end space-x-2">
                  {workflow.status === "draft" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => submitForApproval(workflow.id)}
                      disabled={actionInProgress === workflow.id}
                    >
                      {actionInProgress === workflow.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      Submit for Approval
                    </Button>
                  )}

                  {workflow.status === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => pauseWorkflow(workflow.id)}
                      disabled={actionInProgress === workflow.id}
                    >
                      {actionInProgress === workflow.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <PauseCircle className="h-4 w-4 mr-2" />
                      )}
                      Pause
                    </Button>
                  )}

                  {(workflow.status === "draft" || workflow.status === "waiting_approval") &&
                    !workflow.requires_approval && (
                      <Button
                        size="sm"
                        onClick={() => startWorkflow(workflow.id)}
                        disabled={actionInProgress === workflow.id}
                      >
                        {actionInProgress === workflow.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <PlayCircle className="h-4 w-4 mr-2" />
                        )}
                        Start
                      </Button>
                    )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
