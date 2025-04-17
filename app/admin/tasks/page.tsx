"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type AIFamilyMember, AI_FAMILY_MEMBERS } from "@/types/ai-family"
import type { Task, TaskStatus } from "@/types/task"
import { supabase } from "@/lib/supabase-client"
import { getUserId } from "@/lib/user-utils"
import { Users, RefreshCw, Clock, CheckSquare, AlertTriangle, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

// Sample task data
const sampleTasks = [
  {
    id: "task-1",
    title: "Research AI voice technologies",
    description: "Compile a report on the latest AI voice synthesis technologies and their applications.",
    status: "in-progress",
    priority: "high",
    assignedTo: "stan",
    due_date: "2023-05-15T00:00:00Z",
    created_at: "2023-05-01T00:00:00Z",
  },
  {
    id: "task-2",
    title: "Create weekly content calendar",
    description: "Develop a content calendar for social media posts for the upcoming week.",
    status: "pending",
    priority: "medium",
    assignedTo: "sophia",
    due_date: "2023-05-10T00:00:00Z",
    created_at: "2023-05-02T00:00:00Z",
  },
  {
    id: "task-3",
    title: "Organize digital files",
    description: "Sort and organize digital files in the shared drive according to the new filing system.",
    status: "completed",
    priority: "low",
    assignedTo: "lyra",
    due_date: "2023-05-05T00:00:00Z",
    created_at: "2023-05-01T00:00:00Z",
  },
  {
    id: "task-4",
    title: "Research market trends",
    description: "Analyze current market trends in AI technology and prepare a summary report.",
    status: "completed",
    priority: "high",
    assignedTo: "max",
    due_date: "2023-05-03T00:00:00Z",
    created_at: "2023-04-28T00:00:00Z",
  },
]

// AI family members for assignment
const aiMembersSample = [
  { id: "stan", name: "Stan", role: "Technical Lead" },
  { id: "sophia", name: "Sophia", role: "Creative Director" },
  { id: "lyra", name: "Lyra", role: "Home Assistant" },
  { id: "max", name: "Max", role: "Education Specialist" },
]

export default function TaskManagementPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [aiMembers, setAiMembers] = useState<AIFamilyMember[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [taskFilter, setTaskFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskDetails, setShowTaskDetails] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  const filteredTasks2 = activeTab === "all" ? tasks : tasks.filter((task) => task.status === activeTab)

  const updateTaskStatus = (taskId: string, newStatus: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))

    toast({
      title: "Task Updated",
      description: `Task status changed to ${newStatus}`,
    })
  }

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const userId = await getUserId()
        if (!userId) {
          router.push("/login")
          return
        }

        // In a real app, you would check if the user is an admin
        // For now, we'll assume the user is an admin
        setIsAdmin(true)

        // Load AI members
        loadAiMembers()

        // Load tasks
        loadTasks()
      } catch (error) {
        console.error("Error checking admin status:", error)
        toast({
          title: "Authentication Error",
          description: "Please log in again to continue.",
          variant: "destructive",
        })
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  // Load AI Family members
  const loadAiMembers = async () => {
    try {
      const { data, error } = await supabase.from("ai_family_members").select("*")

      if (error) {
        console.error("Error loading AI Family members:", error)
        // If there's an error, use the default AI Family members
        setAiMembers(AI_FAMILY_MEMBERS)
        return
      }

      if (data && data.length > 0) {
        // Map database fields to our AIFamilyMember interface
        const mappedMembers = data.map((member) => ({
          id: member.member_id,
          name: member.name,
          specialty: member.specialty,
          description: member.description,
          avatarUrl: member.avatar_url,
          color: member.color,
          model: member.model,
          fallbackModel: member.fallback_model,
          capabilities: member.capabilities
            ? Array.isArray(member.capabilities)
              ? member.capabilities
              : JSON.parse(member.capabilities)
            : [],
          systemPrompt: member.system_prompt,
          isActive: true,
        }))
        setAiMembers(mappedMembers)
      } else {
        // If no data in database, use the default AI Family members
        setAiMembers(AI_FAMILY_MEMBERS)
      }
    } catch (error) {
      console.error("Error in loadAiMembers:", error)
      // Fallback to default members
      setAiMembers(AI_FAMILY_MEMBERS)
    }
  }

  // Load tasks from database
  const loadTasks = async () => {
    try {
      // const { data, error } = await supabase
      //   .from("ai_family_tasks")
      //   .select("*")
      //   .order("created_at", { ascending: false })

      // if (error) throw error

      // if (data) {
      //   setTasks(data as Task[])
      //   setFilteredTasks(data as Task[])
      // }
      setTasks(sampleTasks as Task[])
      setFilteredTasks(sampleTasks as Task[])
    } catch (error) {
      console.error("Error loading tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle task approval
  const approveTask = async (taskId: string) => {
    try {
      const userId = await getUserId()

      const { error } = await supabase
        .from("ai_family_tasks")
        .update({
          status: "completed",
          approved_by: userId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId)

      if (error) throw error

      // Update local state
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "completed" as TaskStatus } : t)))

      // Update filtered tasks
      applyFilters()

      toast({
        title: "Task Approved",
        description: "The task has been approved and marked as completed.",
      })
    } catch (error) {
      console.error("Error approving task:", error)
      toast({
        title: "Error",
        description: "Failed to approve task. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle task rejection
  const rejectTask = async (taskId: string, reason: string) => {
    try {
      const userId = await getUserId()

      const { error } = await supabase
        .from("ai_family_tasks")
        .update({
          status: "rejected",
          rejection_reason: reason,
          rejected_by: userId,
          rejected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId)

      if (error) throw error

      // Update local state
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: "rejected" as TaskStatus, rejection_reason: reason } : t)),
      )

      // Update filtered tasks
      applyFilters()

      toast({
        title: "Task Rejected",
        description: "The task has been rejected and sent back for revision.",
      })
    } catch (error) {
      console.error("Error rejecting task:", error)
      toast({
        title: "Error",
        description: "Failed to reject task. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle task reassignment
  const reassignTask = async (taskId: string, newAssigneeId: string) => {
    try {
      const userId = await getUserId()

      const { error } = await supabase
        .from("ai_family_tasks")
        .update({
          assigned_to: newAssigneeId,
          status: "pending",
          reassigned_at: new Date().toISOString(),
          reassigned_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId)

      if (error) throw error

      // Update local state
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                assigned_to: newAssigneeId,
                status: "pending" as TaskStatus,
              }
            : t,
        ),
      )

      // Update filtered tasks
      applyFilters()

      toast({
        title: "Task Reassigned",
        description: `The task has been reassigned to ${aiMembers.find((m) => m.id === newAssigneeId)?.name || "another AI Family member"}.`,
      })
    } catch (error) {
      console.error("Error reassigning task:", error)
      toast({
        title: "Error",
        description: "Failed to reassign task. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Apply filters to tasks
  const applyFilters = () => {
    let filtered = [...tasks]

    // Filter by AI Family member
    if (taskFilter !== "all") {
      filtered = filtered.filter((task) => task.assigned_to === taskFilter)
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    setFilteredTasks(filtered)
  }

  // Effect to apply filters when filter values change
  useEffect(() => {
    applyFilters()
  }, [taskFilter, statusFilter, tasks])

  // View task details
  const viewTaskDetails = (task: Task) => {
    setSelectedTask(task)
    setShowTaskDetails(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading task management...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need administrator privileges to access this page.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">Manage tasks assigned to AI Family members</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/ai-family")}>
            <Users className="h-4 w-4 mr-2" />
            AI Family
          </Button>
          <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredTasks2.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-medium mb-2">No Tasks Found</h3>
              <p className="text-muted-foreground mb-4">
                {activeTab === "all" ? "You haven't created any tasks yet." : `You don't have any ${activeTab} tasks.`}
              </p>
              <Link href="/admin/tasks/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Task
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks2.map((task) => {
                const assignedMember = aiMembers.find((m) => m.id === task.assigned_to)
                return (
                  <Card key={task.id} className="overflow-hidden">
                    <div
                      className="h-2"
                      style={{
                        backgroundColor:
                          task.priority === "high" ? "#ef4444" : task.priority === "medium" ? "#f59e0b" : "#10b981",
                      }}
                    ></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <Badge
                          variant={
                            task.status === "completed"
                              ? "success"
                              : task.status === "in-progress"
                                ? "default"
                                : "outline"
                          }
                        >
                          {task.status.replace("-", " ")}
                        </Badge>
                      </div>
                      <CardDescription>
                        Assigned to: {aiMembers.find((m) => m.id === task.assigned_to)?.name || "Unassigned"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{task.description}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Due: {new Date(task.due_date!).toLocaleDateString()}</span>
                        {new Date(task.due_date!).getTime() < new Date().getTime() && task.status !== "completed" && (
                          <span className="ml-2 flex items-center text-red-500">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Overdue
                          </span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Link href={`/admin/tasks/${task.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      {task.status !== "completed" ? (
                        <Button size="sm" onClick={() => updateTaskStatus(task.id, "completed")}>
                          <CheckSquare className="h-4 w-4 mr-1" />
                          Mark Complete
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => updateTaskStatus(task.id, "in-progress")}>
                          Reopen
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
