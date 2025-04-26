"use client"

import { useState } from "react"
import Link from "next/link"
import { useCrewAI } from "@/components/crew-ai-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, CheckCircle2, Clock, AlertCircle, ArrowRightLeft, Plus, Brain, Database, Loader2 } from "lucide-react"
import { SetupCrewAIButton } from "@/components/setup-crew-ai-button"
import { Skeleton } from "@/components/ui/skeleton"

export default function CrewAIDashboardPage() {
  const { agents, tasks, loading, tablesExist, isCheckingTables } = useCrewAI()
  const [activeTab, setActiveTab] = useState("overview")

  // Count tasks by status
  const taskCounts = {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === "pending").length,
    in_progress: tasks.filter((task) => task.status === "in_progress").length,
    completed: tasks.filter((task) => task.status === "completed").length,
    handoff: tasks.filter((task) => task.status === "handoff").length,
    failed: tasks.filter((task) => task.status === "failed").length,
  }

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
            <Brain className="h-3 w-3" /> In Progress
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

  if (isCheckingTables) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">CrewAI Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage AI family members as a crew with task assignment and collaboration
          </p>
        </div>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Checking Database Status
            </CardTitle>
            <CardDescription>Verifying if the required database tables exist...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading && !isCheckingTables) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Loading CrewAI dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // If tables don't exist, show setup screen
  if (!tablesExist) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">CrewAI Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage AI family members as a crew with task assignment and collaboration
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Setup Required
            </CardTitle>
            <CardDescription>
              The CrewAI database tables need to be set up before you can use this feature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              CrewAI requires database tables to store tasks, assignments, and other information. Click the button below
              to set up the required database tables.
            </p>
            <SetupCrewAIButton />
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            After setup is complete, please refresh the page to start using CrewAI.
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What is CrewAI?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              CrewAI allows you to assign tasks to your AI family members based on their skills and specialties. Each AI
              agent can:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Accept and work on tasks that match their expertise</li>
              <li>Hand off tasks to other agents when needed</li>
              <li>Collaborate with other agents on complex problems</li>
              <li>Maintain memory of past tasks and interactions</li>
            </ul>
            <p>
              Once you set up the database, you'll be able to create tasks, assign them to agents, and track their
              progress.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">CrewAI Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage AI family members as a crew with task assignment and collaboration
          </p>
        </div>
        <Button asChild>
          <Link href="/crew-ai/tasks/new">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Link>
        </Button>
      </div>

      {typeof window !== "undefined" && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{agents.length}</div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href="/crew-ai/agents">View All Agents</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{taskCounts.in_progress}</div>
                    <Brain className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href="/crew-ai/tasks?status=in_progress">View Active Tasks</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{taskCounts.completed}</div>
                    <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href="/crew-ai/tasks?status=completed">View Completed Tasks</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="mt-8">
              <h2 className="mb-4 text-xl font-semibold">Recent Tasks</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {tasks.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-muted-foreground">No tasks found. Create your first task to get started.</p>
                      </div>
                    ) : (
                      tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-4">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Assigned to:{" "}
                              {task.assigned_to
                                ? agents.find((a) => a.id === task.assigned_to)?.name || "Unknown"
                                : "Unassigned"}
                            </p>
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {task.tags.map((tag, tagIndex) => (
                                  <Badge
                                    key={tagIndex}
                                    variant="outline"
                                    className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                                  >
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            {getStatusBadge(task.status)}
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/crew-ai/tasks/${task.id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href="/crew-ai/tasks">View All Tasks</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="agents">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <Card key={agent.id}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={agent.avatar_url || "/placeholder.svg"} alt={agent.name} />
                        <AvatarFallback>{agent.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{agent.name}</CardTitle>
                        <CardDescription>{agent.role}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{agent.description || `Specializes in ${agent.specialty}`}</p>
                    <div>
                      <h3 className="mb-2 text-sm font-medium">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {agent.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                        {agent.skills.length > 3 && <Badge variant="outline">+{agent.skills.length - 3} more</Badge>}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/crew-ai/agents/${agent.id}`}>View Profile</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">All Tasks</h2>
              <Button asChild>
                <Link href="/crew-ai/tasks/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Link>
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {tasks.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">No tasks found. Create your first task to get started.</p>
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Assigned to:{" "}
                            {task.assigned_to
                              ? agents.find((a) => a.id === task.assigned_to)?.name || "Unknown"
                              : "Unassigned"}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(task.status)}
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/crew-ai/tasks/${task.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
