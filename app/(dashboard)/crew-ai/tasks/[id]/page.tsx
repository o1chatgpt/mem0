"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useCrewAI } from "@/components/crew-ai-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { SimpleMarkdownRenderer } from "@/components/simple-markdown-renderer"
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, ArrowRightLeft, Play, Trash, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const {
    tasks,
    agents,
    loading,
    error,
    selectTask,
    selectedTask,
    updateExistingTask,
    removeTask,
    handoffTaskToAgent,
    executeTaskWithAgent,
  } = useCrewAI()

  // Add tag state variables after the existing state variables
  const [handoffReason, setHandoffReason] = useState("")
  const [selectedAgentId, setSelectedAgentId] = useState("")
  const [executionResult, setExecutionResult] = useState<string | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isHandingOff, setIsHandingOff] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [isAddingTag, setIsAddingTag] = useState(false)

  const id = typeof params.id === "string" ? params.id : ""

  useEffect(() => {
    if (id) {
      selectTask(id)
    }
  }, [id, selectTask, tasks])

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Play className="h-3 w-3" /> In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </Badge>
        )
      case "handoff":
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <ArrowRightLeft className="h-3 w-3" /> Handoff
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Handle task execution
  const handleExecuteTask = async () => {
    if (!selectedTask || !selectedTask.assigned_to) return

    setIsExecuting(true)
    try {
      const result = await executeTaskWithAgent(selectedTask.id!, selectedTask.assigned_to)
      setExecutionResult(result.result)
    } catch (error) {
      console.error("Error executing task:", error)
    } finally {
      setIsExecuting(false)
    }
  }

  // Handle task handoff
  const handleHandoffTask = async () => {
    if (!selectedTask || !selectedTask.assigned_to || !selectedAgentId || !handoffReason) return

    setIsHandingOff(true)
    try {
      await handoffTaskToAgent(selectedTask.id!, selectedTask.assigned_to, selectedAgentId, handoffReason)
      setHandoffReason("")
      setSelectedAgentId("")
    } catch (error) {
      console.error("Error handing off task:", error)
    } finally {
      setIsHandingOff(false)
    }
  }

  // Handle task deletion
  const handleDeleteTask = async () => {
    if (!selectedTask) return

    setIsDeleting(true)
    try {
      const success = await removeTask(selectedTask.id!)
      if (success) {
        router.push("/crew-ai/tasks")
      }
    } catch (error) {
      console.error("Error deleting task:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Add a function to add a tag to the task
  const handleAddTag = async () => {
    if (!tagInput.trim() || !selectedTask) return

    setIsAddingTag(true)
    try {
      // Get current tags or empty array if none
      const currentTags = selectedTask.tags || []

      // Only add if the tag doesn't already exist
      if (!currentTags.includes(tagInput.trim())) {
        const updatedTags = [...currentTags, tagInput.trim()]
        await updateExistingTask(selectedTask.id!, { tags: updatedTags })
        setTagInput("")
      }
    } catch (error) {
      console.error("Error adding tag:", error)
    } finally {
      setIsAddingTag(false)
    }
  }

  // Add a function to remove a tag from the task
  const handleRemoveTag = async (tagToRemove: string) => {
    if (!selectedTask || !selectedTask.tags) return

    try {
      const updatedTags = selectedTask.tags.filter((tag) => tag !== tagToRemove)
      await updateExistingTask(selectedTask.id!, { tags: updatedTags })
    } catch (error) {
      console.error("Error removing tag:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">Loading task details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!selectedTask) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">Task not found</p>
        </div>
      </div>
    )
  }

  const assignedAgent = agents.find((agent) => agent.id === selectedTask.assigned_to)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/crew-ai/tasks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{selectedTask.title}</h1>
          <div className="flex items-center gap-2">
            {getStatusBadge(selectedTask.status)}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Task</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this task? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {}}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteTask} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <p className="text-lg text-muted-foreground">Task ID: {selectedTask.id}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <p className="text-sm">{selectedTask.description}</p>
                </div>

                {selectedTask.skills_required && selectedTask.skills_required.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTask.skills_required.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTask.tags && selectedTask.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTask.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        >
                          #{tag}
                          <button
                            type="button"
                            className="ml-1 rounded-full h-4 w-4 inline-flex items-center justify-center text-xs"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTask.handoff_reason && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Handoff Reason</h3>
                    <p className="text-sm">{selectedTask.handoff_reason}</p>
                  </div>
                )}

                {selectedTask.result && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Result</h3>
                    <div className="rounded-md bg-muted p-4">
                      <SimpleMarkdownRenderer content={selectedTask.result} />
                    </div>
                  </div>
                )}

                {executionResult && !selectedTask.result && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Execution Result</h3>
                    <div className="rounded-md bg-muted p-4">
                      <SimpleMarkdownRenderer content={executionResult} />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Created: {new Date(selectedTask.created_at || "").toLocaleString()}
              </div>
              {selectedTask.due_date && (
                <div className="text-sm text-muted-foreground">
                  Due: {new Date(selectedTask.due_date).toLocaleString()}
                </div>
              )}
            </CardFooter>
          </Card>

          {selectedTask.status !== "completed" && selectedTask.status !== "failed" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Task Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedTask.assigned_to && (
                    <Button
                      onClick={handleExecuteTask}
                      disabled={isExecuting || selectedTask.status === "completed"}
                      className="w-full"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {isExecuting ? "Executing..." : "Execute Task"}
                    </Button>
                  )}

                  {selectedTask.assigned_to && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Handoff to Another Agent</h3>
                      <div className="flex gap-2">
                        <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select agent" />
                          </SelectTrigger>
                          <SelectContent>
                            {agents
                              .filter((agent) => agent.id !== selectedTask.assigned_to)
                              .map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.name} ({agent.specialty})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleHandoffTask}
                          disabled={isHandingOff || !selectedAgentId || !handoffReason}
                        >
                          <ArrowRight className="mr-2 h-4 w-4" />
                          {isHandingOff ? "Handing off..." : "Handoff"}
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Reason for handoff..."
                        value={handoffReason}
                        onChange={(e) => setHandoffReason(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium mb-2">Add Tag</h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag (e.g., urgent, frontend, bug)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      />
                      <Button onClick={handleAddTag} disabled={isAddingTag || !tagInput.trim()}>
                        {isAddingTag ? "Adding..." : "Add"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          {assignedAgent ? (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src={assignedAgent.avatar_url || "/placeholder.svg"} alt={assignedAgent.name} />
                    <AvatarFallback>{assignedAgent.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-medium">{assignedAgent.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{assignedAgent.role}</p>
                  <Badge className="mb-4">{assignedAgent.specialty}</Badge>

                  <div className="w-full">
                    <h4 className="text-sm font-medium mb-2 text-left">Skills</h4>
                    <div className="flex flex-wrap gap-2 justify-start">
                      {assignedAgent.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/crew-ai/agents/${assignedAgent.id}`}>View Profile</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Assign Agent</CardTitle>
                <CardDescription>This task is not assigned to any agent yet</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.specialty})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={!selectedAgentId}
                  onClick={() =>
                    updateExistingTask(selectedTask.id!, { assigned_to: selectedAgentId, status: "assigned" })
                  }
                >
                  Assign Agent
                </Button>
              </CardFooter>
            </Card>
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Task Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Priority</h3>
                  <Badge
                    variant={
                      selectedTask.priority === "high"
                        ? "destructive"
                        : selectedTask.priority === "medium"
                          ? "warning"
                          : "outline"
                    }
                  >
                    {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Created By</h3>
                  <p className="text-sm">{selectedTask.created_by}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Created At</h3>
                  <p className="text-sm">{new Date(selectedTask.created_at || "").toLocaleString()}</p>
                </div>
                {selectedTask.updated_at && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Last Updated</h3>
                    <p className="text-sm">{new Date(selectedTask.updated_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
