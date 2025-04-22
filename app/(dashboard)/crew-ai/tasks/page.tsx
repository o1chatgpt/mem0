"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCrewAI } from "@/components/crew-ai-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertCircle, ArrowRightLeft, Plus, Play, Filter, Database } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { SetupCrewAIButton } from "@/components/setup-crew-ai-button"

export default function TasksPage() {
  const searchParams = useSearchParams()
  const { tasks, agents, loading, tablesExist, fetchTasks } = useCrewAI()
  const [filteredTasks, setFilteredTasks] = useState(tasks)
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")
  const [agentFilter, setAgentFilter] = useState("all")
  const [tagFilter, setTagFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    let filtered = [...tasks]

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    // Apply agent filter
    if (agentFilter !== "all") {
      filtered = filtered.filter((task) => task.assigned_to === agentFilter)
    }

    // Apply tag filter
    if (tagFilter !== "all") {
      filtered = filtered.filter((task) => task.tags && task.tags.includes(tagFilter))
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (task) => task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query),
      )
    }

    setFilteredTasks(filtered)
  }, [tasks, statusFilter, agentFilter, tagFilter, searchQuery])

  // Get all unique tags from tasks
  const getAllTags = () => {
    const allTags = new Set<string>()
    tasks.forEach((task) => {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach((tag) => allTags.add(tag))
      }
    })
    return Array.from(allTags).sort()
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

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    )
  }

  // If tables don't exist, show setup screen
  if (!tablesExist) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Tasks</h1>
          <p className="text-lg text-muted-foreground">Manage and track tasks assigned to AI family members</p>
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
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Tasks</h1>
          <p className="text-lg text-muted-foreground">Manage and track tasks assigned to AI family members</p>
        </div>
        <Button asChild>
          <Link href="/crew-ai/tasks/new">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Input placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <div className="w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Status</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="handoff">Handoff</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Agent</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Tag</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {getAllTags().map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    #{tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Tasks ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No tasks found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {task.description.length > 60 ? `${task.description.substring(0, 60)}...` : task.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
