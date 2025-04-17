import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus } from "lucide-react"

export default function TasksPage() {
  // Sample tasks
  const tasks = [
    {
      id: "task-1",
      title: "Research AI voice technologies",
      assignedTo: "stan",
      assigneeName: "Stan",
      status: "in-progress",
      priority: "high",
      dueDate: "2023-05-15",
    },
    {
      id: "task-2",
      title: "Create weekly content calendar",
      assignedTo: "sophia",
      assigneeName: "Sophia",
      status: "pending",
      priority: "medium",
      dueDate: "2023-05-20",
    },
    {
      id: "task-3",
      title: "Organize digital files",
      assignedTo: "lyra",
      assigneeName: "Lyra",
      status: "completed",
      priority: "low",
      dueDate: "2023-05-10",
    },
  ]

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Task Management</h1>
        </div>

        <Link href="/tasks/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Task
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{task.title}</CardTitle>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    task.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : task.status === "in-progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {task.status === "completed"
                    ? "Completed"
                    : task.status === "in-progress"
                      ? "In Progress"
                      : "Pending"}
                </span>
              </div>
              <CardDescription>Assigned to: {task.assigneeName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Priority: </span>
                  <span
                    className={
                      task.priority === "high"
                        ? "text-red-600"
                        : task.priority === "medium"
                          ? "text-amber-600"
                          : "text-green-600"
                    }
                  >
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Due Date: </span>
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={`/tasks/${task.id}`}>View Details</Link>
              </Button>
              {task.status !== "completed" && <Button variant="outline">Mark as Completed</Button>}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
