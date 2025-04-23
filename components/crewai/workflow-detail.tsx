"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import {
  ArrowLeft,
  Workflow,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Loader2,
  FileText,
  ImageIcon,
  Globe,
  Code,
  Database,
  Search,
  Upload,
} from "lucide-react"
import type { CrewWorkflow, TaskStatus } from "@/lib/crewai/crewai-service"

interface WorkflowDetailProps {
  workflow: CrewWorkflow
  onBack: () => void
  onRefresh: () => void
}

export function WorkflowDetail({ workflow, onBack, onRefresh }: WorkflowDetailProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  // Calculate workflow progress
  const calculateProgress = () => {
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

  // Get task status badge
  const getTaskStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "in_progress":
        return <Badge className="bg-blue-500">In Progress</Badge>
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

  // Get task type icon
  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case "web_scraping":
        return <Globe className="h-4 w-4" />
      case "content_creation":
        return <FileText className="h-4 w-4" />
      case "image_generation":
        return <ImageIcon className="h-4 w-4" />
      case "code_generation":
        return <Code className="h-4 w-4" />
      case "data_analysis":
        return <Database className="h-4 w-4" />
      case "research":
        return <Search className="h-4 w-4" />
      case "validation":
        return <CheckCircle2 className="h-4 w-4" />
      case "deployment":
        return <Upload className="h-4 w-4" />
      default:
        return <Workflow className="h-4 w-4" />
    }
  }

  // Start workflow
  const startWorkflow = async () => {
    setActionInProgress("start")
    try {
      const response = await fetch(`/api/crewai/workflows/${workflow.id}/start`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to start workflow")
      }

      toast({
        title: "Workflow Started",
        description: "The workflow has been started successfully",
      })

      // Refresh workflow
      onRefresh()
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
  const pauseWorkflow = async () => {
    setActionInProgress("pause")
    try {
      const response = await fetch(`/api/crewai/workflows/${workflow.id}/pause`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to pause workflow")
      }

      toast({
        title: "Workflow Paused",
        description: "The workflow has been paused successfully",
      })

      // Refresh workflow
      onRefresh()
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
  const submitForApproval = async () => {
    setActionInProgress("submit")
    try {
      const response = await fetch(`/api/crewai/workflows/${workflow.id}/submit`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to submit workflow for approval")
      }

      toast({
        title: "Workflow Submitted",
        description: "The workflow has been submitted for approval",
      })

      // Refresh workflow
      onRefresh()
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
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <CardTitle className="flex items-center">
                {workflow.name}
                <span className="ml-2">{getStatusBadge(workflow.status)}</span>
              </CardTitle>
              <CardDescription>{workflow.description || "No description provided"}</CardDescription>
            </div>
          </div>
          <div className="flex space-x-2">
            {workflow.status === "draft" && (
              <Button variant="outline" size="sm" onClick={submitForApproval} disabled={actionInProgress === "submit"}>
                {actionInProgress === "submit" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Submit for Approval
              </Button>
            )}

            {workflow.status === "active" && (
              <Button variant="outline" size="sm" onClick={pauseWorkflow} disabled={actionInProgress === "pause"}>
                {actionInProgress === "pause" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PauseCircle className="h-4 w-4 mr-2" />
                )}
                Pause
              </Button>
            )}

            {(workflow.status === "draft" || workflow.status === "waiting_approval") && !workflow.requires_approval && (
              <Button size="sm" onClick={startWorkflow} disabled={actionInProgress === "start"}>
                {actionInProgress === "start" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4 mr-2" />
                )}
                Start
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({workflow.tasks.length})</TabsTrigger>
            {workflow.admin_notes && <TabsTrigger value="notes">Admin Notes</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span>{calculateProgress()}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Created</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{new Date(workflow.created_at).toLocaleDateString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(workflow.created_at).toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {workflow.tasks.filter((t) => t.status === "completed").length}/{workflow.tasks.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {workflow.tasks.filter((t) => t.status === "in_progress").length} in progress
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">{workflow.status.replace("_", " ")}</div>
                    {workflow.requires_approval && (
                      <div className="flex items-center text-xs text-amber-500 mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Requires Approval
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-md">Workflow Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-6 border-l-2 border-muted space-y-4">
                    <div className="relative">
                      <div className="absolute -left-[25px] p-1 bg-background border-2 border-muted rounded-full">
                        <Clock className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">Workflow Created</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(workflow.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {workflow.status !== "draft" && (
                      <div className="relative">
                        <div className="absolute -left-[25px] p-1 bg-background border-2 border-muted rounded-full">
                          {workflow.status === "waiting_approval" ? (
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                          ) : workflow.status === "active" ? (
                            <PlayCircle className="h-4 w-4 text-blue-500" />
                          ) : workflow.status === "completed" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {workflow.status === "waiting_approval"
                              ? "Submitted for Approval"
                              : workflow.status === "active"
                                ? "Workflow Started"
                                : workflow.status === "completed"
                                  ? "Workflow Completed"
                                  : "Workflow Failed"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(workflow.updated_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="space-y-4">
              {workflow.tasks.map((task, index) => (
                <Card key={task.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center text-lg">
                          <Badge className="mr-2">{index + 1}</Badge>
                          {task.title}
                          <span className="ml-2">{getTaskStatusBadge(task.status)}</span>
                        </CardTitle>
                        <CardDescription className="flex items-center">
                          <Badge variant="outline" className="mr-2 flex items-center">
                            {getTaskTypeIcon(task.type)}
                            <span className="ml-1 capitalize">{task.type.replace("_", " ")}</span>
                          </Badge>
                          {task.assignee_id && (
                            <span className="text-sm">Assigned to AI Family Member #{task.assignee_id}</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm">{task.description || "No description provided"}</p>

                      {task.dependencies.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Dependencies:</p>
                          <div className="flex flex-wrap gap-2">
                            {task.dependencies.map((dep) => {
                              const depIndex = Number.parseInt(dep.split("_")[1])
                              const depTask = workflow.tasks[depIndex]
                              return (
                                <Badge key={dep} variant="outline" className="flex items-center">
                                  <Badge className="mr-1 h-5 w-5 flex items-center justify-center p-0">
                                    {depIndex + 1}
                                  </Badge>
                                  {depTask?.title || `Task ${depIndex + 1}`}
                                </Badge>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {task.input_data && Object.keys(task.input_data).length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Input Data:</p>
                          <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-40">
                            {JSON.stringify(task.input_data, null, 2)}
                          </pre>
                        </div>
                      )}

                      {task.output_data && Object.keys(task.output_data).length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Output Data:</p>
                          <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-40">
                            {JSON.stringify(task.output_data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {workflow.admin_notes && (
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle className="text-md">Administrator Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 mb-2">Notes for Administrator</p>
                        <p className="text-amber-700">{workflow.admin_notes}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
