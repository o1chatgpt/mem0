"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import {
  Plus,
  Trash,
  Save,
  Workflow,
  Globe,
  FileText,
  ImageIcon,
  Code,
  Database,
  Search,
  CheckCircle2,
  Upload,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { createClientComponentClient } from "@/lib/db"
import type { CrewTask, CrewWorkflow, TaskType } from "@/lib/crewai/crewai-service"

interface WorkflowDesignerProps {
  userId: number
  onSave?: (workflow: CrewWorkflow) => void
  initialWorkflow?: CrewWorkflow
}

export function WorkflowDesigner({ userId, onSave, initialWorkflow }: WorkflowDesignerProps) {
  const [workflow, setWorkflow] = useState<Partial<CrewWorkflow>>({
    name: initialWorkflow?.name || "",
    description: initialWorkflow?.description || "",
    creator_id: userId,
    status: initialWorkflow?.status || "draft",
    requires_approval: initialWorkflow?.requires_approval !== false,
    admin_notes: initialWorkflow?.admin_notes || null,
    tasks: initialWorkflow?.tasks || [],
  })

  const [aiMembers, setAiMembers] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("details")
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch AI family members
  useEffect(() => {
    const fetchAiMembers = async () => {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase.from("fm_ai_members").select("*").eq("user_id", userId).order("name")

      if (error) {
        console.error("Error fetching AI members:", error)
        return
      }

      setAiMembers(data || [])
    }

    fetchAiMembers()
  }, [userId])

  // Update workflow details
  const updateWorkflowDetails = (field: string, value: any) => {
    setWorkflow((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Add a new task
  const addTask = () => {
    const newTask: Partial<CrewTask> = {
      title: "",
      description: "",
      type: "web_scraping",
      status: "pending",
      assignee_id: null,
      creator_id: userId,
      workflow_id: "",
      dependencies: [],
      input_data: {},
      output_data: null,
      priority: "medium",
      due_date: null,
    }

    setWorkflow((prev) => ({
      ...prev,
      tasks: [...(prev.tasks || []), newTask as CrewTask],
    }))
  }

  // Update task
  const updateTask = (index: number, field: string, value: any) => {
    setWorkflow((prev) => {
      const tasks = [...(prev.tasks || [])]
      tasks[index] = {
        ...tasks[index],
        [field]: value,
      }
      return {
        ...prev,
        tasks,
      }
    })

    // Clear error for this task
    const errorKey = `task_${index}_${field}`
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }

  // Remove task
  const removeTask = (index: number) => {
    setWorkflow((prev) => {
      const tasks = [...(prev.tasks || [])]
      tasks.splice(index, 1)

      // Update dependencies
      const updatedTasks = tasks.map((task) => {
        const dependencies = task.dependencies.filter((dep) => dep !== `task_${index}`)
        return { ...task, dependencies }
      })

      return {
        ...prev,
        tasks: updatedTasks,
      }
    })
  }

  // Toggle task dependency
  const toggleDependency = (taskIndex: number, dependencyIndex: number) => {
    setWorkflow((prev) => {
      const tasks = [...(prev.tasks || [])]
      const task = tasks[taskIndex]

      // Can't depend on itself or later tasks
      if (taskIndex <= dependencyIndex) {
        return prev
      }

      const dependencyId = `task_${dependencyIndex}`
      const dependencies = [...task.dependencies]

      if (dependencies.includes(dependencyId)) {
        // Remove dependency
        const index = dependencies.indexOf(dependencyId)
        dependencies.splice(index, 1)
      } else {
        // Add dependency
        dependencies.push(dependencyId)
      }

      tasks[taskIndex] = {
        ...task,
        dependencies,
      }

      return {
        ...prev,
        tasks,
      }
    })
  }

  // Validate workflow
  const validateWorkflow = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate workflow details
    if (!workflow.name?.trim()) {
      newErrors.name = "Workflow name is required"
    }
    // Validate tasks
    ;(workflow.tasks || []).forEach((task, index) => {
      if (!task.title?.trim()) {
        newErrors[`task_${index}_title`] = "Task title is required"
      }

      if (!task.assignee_id) {
        newErrors[`task_${index}_assignee_id`] = "Task assignee is required"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Save workflow
  const saveWorkflow = async () => {
    if (!validateWorkflow()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      console.log("Sending workflow data:", {
        name: workflow.name,
        description: workflow.description,
        creator_id: workflow.creator_id,
        tasks: workflow.tasks?.length || 0,
      })

      // Ensure tasks have proper structure
      const preparedWorkflow = {
        ...workflow,
        tasks: (workflow.tasks || []).map((task) => ({
          ...task,
          dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
          input_data: task.input_data || {},
          output_data: task.output_data || null,
        })),
      }

      const response = await fetch("/api/crewai/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preparedWorkflow),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.details || "Failed to save workflow")
      }

      const savedWorkflow = await response.json()

      toast({
        title: "Workflow Saved",
        description: "Your workflow has been saved successfully",
      })

      if (onSave) {
        onSave(savedWorkflow)
      }
    } catch (error) {
      console.error("Error saving workflow:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save workflow",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Get task type icon
  const getTaskTypeIcon = (type: TaskType) => {
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Workflow className="mr-2 h-5 w-5" />
          {initialWorkflow ? "Edit Workflow" : "Create New Workflow"}
        </CardTitle>
        <CardDescription>Design a custom workflow to be executed by your AI family members</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">Workflow Details</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({workflow.tasks?.length || 0})</TabsTrigger>
            <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="space-y-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  value={workflow.name}
                  onChange={(e) => updateWorkflowDetails("name", e.target.value)}
                  placeholder="Enter workflow name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="workflow-description">Description</Label>
                <Textarea
                  id="workflow-description"
                  value={workflow.description}
                  onChange={(e) => updateWorkflowDetails("description", e.target.value)}
                  placeholder="Describe the purpose of this workflow"
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="requires-approval"
                  checked={workflow.requires_approval}
                  onCheckedChange={(checked) => updateWorkflowDetails("requires_approval", checked)}
                />
                <Label htmlFor="requires-approval">Requires admin approval before execution</Label>
              </div>

              {workflow.requires_approval && (
                <div>
                  <Label htmlFor="admin-notes">Notes for Administrator</Label>
                  <Textarea
                    id="admin-notes"
                    value={workflow.admin_notes || ""}
                    onChange={(e) => updateWorkflowDetails("admin_notes", e.target.value)}
                    placeholder="Add any notes for the administrator reviewing this workflow"
                    rows={3}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="space-y-6">
              {(workflow.tasks || []).length === 0 ? (
                <div className="text-center py-8 border rounded-md">
                  <p className="text-muted-foreground mb-4">No tasks added yet</p>
                  <Button onClick={addTask}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {(workflow.tasks || []).map((task, index) => (
                    <Card key={index} className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <Badge className="mr-2">{index + 1}</Badge>
                            <CardTitle className="text-lg">{task.title || "Untitled Task"}</CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTask(index)}
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                        <Badge variant="outline" className="flex items-center w-fit">
                          {getTaskTypeIcon(task.type)}
                          <span className="ml-1 capitalize">{task.type.replace("_", " ")}</span>
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor={`task-${index}-title`}>Task Title</Label>
                          <Input
                            id={`task-${index}-title`}
                            value={task.title}
                            onChange={(e) => updateTask(index, "title", e.target.value)}
                            placeholder="Enter task title"
                            className={errors[`task_${index}_title`] ? "border-red-500" : ""}
                          />
                          {errors[`task_${index}_title`] && (
                            <p className="text-sm text-red-500 mt-1">{errors[`task_${index}_title`]}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`task-${index}-description`}>Description</Label>
                          <Textarea
                            id={`task-${index}-description`}
                            value={task.description}
                            onChange={(e) => updateTask(index, "description", e.target.value)}
                            placeholder="Describe what this task should accomplish"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`task-${index}-type`}>Task Type</Label>
                            <Select value={task.type} onValueChange={(value) => updateTask(index, "type", value)}>
                              <SelectTrigger id={`task-${index}-type`}>
                                <SelectValue placeholder="Select task type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="web_scraping">Web Scraping</SelectItem>
                                <SelectItem value="content_creation">Content Creation</SelectItem>
                                <SelectItem value="image_generation">Image Generation</SelectItem>
                                <SelectItem value="code_generation">Code Generation</SelectItem>
                                <SelectItem value="data_analysis">Data Analysis</SelectItem>
                                <SelectItem value="research">Research</SelectItem>
                                <SelectItem value="validation">Validation</SelectItem>
                                <SelectItem value="deployment">Deployment</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor={`task-${index}-assignee`}>Assign To</Label>
                            <Select
                              value={task.assignee_id?.toString() || ""}
                              onValueChange={(value) =>
                                updateTask(index, "assignee_id", value ? Number.parseInt(value) : null)
                              }
                            >
                              <SelectTrigger
                                id={`task-${index}-assignee`}
                                className={errors[`task_${index}_assignee_id`] ? "border-red-500" : ""}
                              >
                                <SelectValue placeholder="Select AI family member" />
                              </SelectTrigger>
                              <SelectContent>
                                {aiMembers.map((member) => (
                                  <SelectItem key={member.id} value={member.id.toString()}>
                                    {member.name} ({member.role})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors[`task_${index}_assignee_id`] && (
                              <p className="text-sm text-red-500 mt-1">{errors[`task_${index}_assignee_id`]}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`task-${index}-priority`}>Priority</Label>
                            <Select
                              value={task.priority}
                              onValueChange={(value) => updateTask(index, "priority", value)}
                            >
                              <SelectTrigger id={`task-${index}-priority`}>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor={`task-${index}-due-date`}>Due Date (Optional)</Label>
                            <Input
                              id={`task-${index}-due-date`}
                              type="date"
                              value={task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : ""}
                              onChange={(e) =>
                                updateTask(
                                  index,
                                  "due_date",
                                  e.target.value ? new Date(e.target.value).toISOString() : null,
                                )
                              }
                            />
                          </div>
                        </div>

                        {task.type === "web_scraping" && (
                          <div>
                            <Label htmlFor={`task-${index}-url`}>URL to Scrape</Label>
                            <Input
                              id={`task-${index}-url`}
                              value={task.input_data?.url || ""}
                              onChange={(e) =>
                                updateTask(index, "input_data", { ...task.input_data, url: e.target.value })
                              }
                              placeholder="https://example.com"
                            />
                          </div>
                        )}

                        {task.type === "content_creation" && (
                          <div>
                            <Label htmlFor={`task-${index}-content-instructions`}>Content Instructions</Label>
                            <Textarea
                              id={`task-${index}-content-instructions`}
                              value={task.input_data?.instructions || ""}
                              onChange={(e) =>
                                updateTask(index, "input_data", { ...task.input_data, instructions: e.target.value })
                              }
                              placeholder="Provide instructions for content creation"
                              rows={3}
                            />
                          </div>
                        )}

                        {task.type === "image_generation" && (
                          <div>
                            <Label htmlFor={`task-${index}-image-prompt`}>Image Prompt or Instructions</Label>
                            <Textarea
                              id={`task-${index}-image-prompt`}
                              value={task.input_data?.prompt || ""}
                              onChange={(e) =>
                                updateTask(index, "input_data", { ...task.input_data, prompt: e.target.value })
                              }
                              placeholder="Describe the image you want to generate"
                              rows={3}
                            />
                          </div>
                        )}

                        {task.type === "code_generation" && (
                          <div>
                            <Label htmlFor={`task-${index}-code-requirements`}>Code Requirements</Label>
                            <Textarea
                              id={`task-${index}-code-requirements`}
                              value={task.input_data?.requirements || ""}
                              onChange={(e) =>
                                updateTask(index, "input_data", { ...task.input_data, requirements: e.target.value })
                              }
                              placeholder="Describe the code you need"
                              rows={3}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  <Button onClick={addTask} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Task
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="dependencies">
            <div className="space-y-4">
              {(workflow.tasks || []).length < 2 ? (
                <div className="text-center py-8 border rounded-md">
                  <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-2" />
                  <p className="text-muted-foreground mb-2">You need at least two tasks to create dependencies</p>
                  <Button onClick={() => setActiveTab("tasks")}>Go to Tasks</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Define which tasks depend on other tasks. A task will only start when all its dependencies are
                    completed.
                  </p>

                  {(workflow.tasks || []).map((task, taskIndex) => {
                    if (taskIndex === 0) return null // First task can't have dependencies

                    return (
                      <Card key={taskIndex}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <Badge className="mr-2">{taskIndex + 1}</Badge>
                            {task.title || "Untitled Task"}
                          </CardTitle>
                          <CardDescription>Select which tasks must be completed before this one</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {(workflow.tasks || []).slice(0, taskIndex).map((depTask, depIndex) => (
                              <div key={depIndex} className="flex items-center space-x-2">
                                <Switch
                                  id={`task-${taskIndex}-dep-${depIndex}`}
                                  checked={task.dependencies.includes(`task_${depIndex}`)}
                                  onCheckedChange={() => toggleDependency(taskIndex, depIndex)}
                                />
                                <Label htmlFor={`task-${taskIndex}-dep-${depIndex}`} className="flex items-center">
                                  <Badge className="mr-2">{depIndex + 1}</Badge>
                                  {depTask.title || "Untitled Task"}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() =>
            setActiveTab(activeTab === "details" ? "tasks" : activeTab === "tasks" ? "dependencies" : "details")
          }
        >
          {activeTab === "details" ? "Next: Tasks" : activeTab === "tasks" ? "Next: Dependencies" : "Back to Details"}
        </Button>
        <Button onClick={saveWorkflow} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Workflow
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
