"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useCrewAI } from "@/components/crew-ai-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, ArrowRightLeft, Plus } from "lucide-react"

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { agents, tasks, loading, error, selectAgent, selectedAgent, fetchTasksByAgent } = useCrewAI()

  const id = typeof params.id === "string" ? params.id : ""

  useEffect(() => {
    if (id) {
      selectAgent(id)
      fetchTasksByAgent(id)
    }
  }, [id, selectAgent, fetchTasksByAgent])

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
            <Clock className="h-3 w-3" /> In Progress
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

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">Loading agent details...</p>
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

  if (!selectedAgent) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">Agent not found</p>
        </div>
      </div>
    )
  }

  // Filter tasks for this agent
  const agentTasks = tasks.filter((task) => task.assigned_to === selectedAgent.id)
  const activeTasks = agentTasks.filter((task) => task.status === "in_progress" || task.status === "assigned")
  const completedTasks = agentTasks.filter((task) => task.status === "completed")
  const pendingTasks = agentTasks.filter((task) => task.status === "pending")

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/crew-ai/agents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{selectedAgent.name}</h1>
        <p className="text-lg text-muted-foreground">{selectedAgent.role}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={selectedAgent.avatar_url || "/placeholder.svg"} alt={selectedAgent.name} />
                  <AvatarFallback>{selectedAgent.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <CardTitle>{selectedAgent.name}</CardTitle>
                <CardDescription>{selectedAgent.role}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Specialty</h3>
                  <Badge className="w-full justify-center">{selectedAgent.specialty}</Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <p className="text-sm">{selectedAgent.description || `Specializes in ${selectedAgent.specialty}`}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/ai-family/${selectedAgent.id}`}>Chat with {selectedAgent.name}</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Task Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Tasks</span>
                  <Badge variant="secondary">{activeTasks.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completed Tasks</span>
                  <Badge variant="success">{completedTasks.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Tasks</span>
                  <Badge variant="outline">{pendingTasks.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Tasks</span>
                  <Badge>{agentTasks.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="active">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="active">Active Tasks</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="all">All Tasks</TabsTrigger>
              </TabsList>
              <Button asChild size="sm">
                <Link href="/crew-ai/tasks/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Link>
              </Button>
            </div>

            <TabsContent value="active">
              <Card>
                <CardContent className="p-0">
                  {activeTasks.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">No active tasks</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {activeTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-4">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {task.description.length > 60
                                ? `${task.description.substring(0, 60)}...`
                                : task.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            {getStatusBadge(task.status)}
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/crew-ai/tasks/${task.id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed">
              <Card>
                <CardContent className="p-0">
                  {completedTasks.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">No completed tasks</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {completedTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-4">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {task.description.length > 60
                                ? `${task.description.substring(0, 60)}...`
                                : task.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            {getStatusBadge(task.status)}
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/crew-ai/tasks/${task.id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all">
              <Card>
                <CardContent className="p-0">
                  {agentTasks.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">No tasks assigned to this agent</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {agentTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-4">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {task.description.length > 60
                                ? `${task.description.substring(0, 60)}...`
                                : task.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            {getStatusBadge(task.status)}
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/crew-ai/tasks/${task.id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
