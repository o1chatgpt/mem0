"use client"

import { useEffect } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import Link from "next/link"

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  assignedTo: string
  dueDate: string
  createdAt: string
  createdBy: string
}

export function TaskDetail({ taskId }: { taskId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadTask = async () => {
    try {
      // In a real app, this would fetch the task from the database
      // For now, we'll use mock data
      const mockTasks = [
        {
          id: "task-1",
          title: "Research AI voice technologies",
          description: "Compile a report on the latest AI voice synthesis technologies and their applications.",
          status: "in-progress",
          priority: "high",
          assignedTo: "stan",
          dueDate: "2023-05-15",
          createdAt: "2023-05-01",
          createdBy: "admin",
        },
      ]

      const taskData = mockTasks.find((t) => t.id === taskId)
      if (taskData) {
        setTask(taskData)
      } else {
        toast({
          title: "Task not found",
          description: "The requested task could not be found.",
          variant: "destructive",
        })
        router.push("/tasks")
      }
    } catch (error) {
      console.error("Error loading task:", error)
      toast({
        title: "Error",
        description: "Failed to load task details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTask()
  }, [taskId])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!task) {
    return <div>Task not found</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tasks">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Task Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{task.title}</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p>{task.description}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Status</h3>
            <Badge variant="outline" className={task.status === "completed" ? "bg-green-100" : "bg-blue-100"}>
              {task.status}
            </Badge>
          </div>

          <div>
            <h3 className="font-medium mb-2">Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Priority:</span>
                <Badge variant="outline" className={task.priority === "high" ? "bg-red-100" : "bg-blue-100"}>
                  {task.priority}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-2">{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Assigned to:</span>
                <span className="ml-2">{task.assignedTo}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Created by:</span>
                <span className="ml-2">{task.createdBy}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
