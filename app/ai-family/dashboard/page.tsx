"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AIFamilySidebar } from "@/components/ai-family-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AI_FAMILY_MEMBERS } from "@/data/ai-family-members"
import { CheckSquare, Calendar, Users, Clock, CheckCircle, AlertCircle, Hourglass } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AIFamilyDashboardPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState<string>("week")

  // Calculate statistics
  const totalMembers = AI_FAMILY_MEMBERS.length
  const activeMembers = AI_FAMILY_MEMBERS.filter((m) => m.isActive).length

  const allTasks = AI_FAMILY_MEMBERS.flatMap((m) => m.tasks)
  const totalTasks = allTasks.length
  const completedTasks = allTasks.filter((t) => t.status === "completed").length
  const inProgressTasks = allTasks.filter((t) => t.status === "in-progress").length
  const pendingTasks = allTasks.filter((t) => t.status === "pending").length

  const allEvents = AI_FAMILY_MEMBERS.flatMap((m) => m.schedule)
  const totalEvents = allEvents.length
  const upcomingEvents = allEvents.filter((e) => new Date(e.startTime) > new Date()).length

  // Calculate task completion rate
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="flex h-screen">
      <AIFamilySidebar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">AI Family Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of AI Family members, tasks, and schedule</p>
          </div>
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
              <TabsTrigger value="quarter">This Quarter</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">AI Family Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold">{totalMembers}</div>
                  <p className="text-xs text-muted-foreground">{activeMembers} active members</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold">{totalTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    {completedTasks} completed, {inProgressTasks} in progress
                  </p>
                </div>
                <CheckSquare className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold">{totalEvents}</div>
                  <p className="text-xs text-muted-foreground">{upcomingEvents} upcoming events</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Task Completion</CardTitle>
              <CardDescription>Task completion rate across all AI Family members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Completed</span>
                  </div>
                  <span className="font-medium">{completedTasks}</span>
                </div>
                <Progress value={taskCompletionRate} className="h-2" />
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs">Completed</span>
                    </div>
                    <span className="text-xl font-bold">{completedTasks}</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-xs">In Progress</span>
                    </div>
                    <span className="text-xl font-bold">{inProgressTasks}</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span className="text-xs">Pending</span>
                    </div>
                    <span className="text-xl font-bold">{pendingTasks}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Member Activity</CardTitle>
              <CardDescription>Most active AI Family members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {AI_FAMILY_MEMBERS.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border-2" style={{ borderColor: member.color }}>
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                      <AvatarFallback style={{ backgroundColor: `${member.color}20`, color: member.color }}>
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {member.tasks.filter((t) => t.status === "completed").length} tasks
                        </span>
                      </div>
                      <Progress
                        value={
                          member.tasks.length > 0
                            ? (member.tasks.filter((t) => t.status === "completed").length / member.tasks.length) * 100
                            : 0
                        }
                        className="h-1 mt-1"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full text-xs"
                  size="sm"
                  onClick={() => router.push("/ai-family")}
                >
                  View All Members
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Tasks due soon across all AI Family members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allTasks
                  .filter((task) => task.status !== "completed" && task.status !== "cancelled")
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .slice(0, 5)
                  .map((task) => {
                    const member = AI_FAMILY_MEMBERS.find((m) => m.tasks.some((t) => t.id === task.id))!
                    return (
                      <div key={task.id} className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {task.status === "in-progress" ? (
                            <Hourglass className="h-5 w-5 text-blue-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium">{task.title}</p>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={member.avatarUrl} alt={member.name} />
                              <AvatarFallback style={{ backgroundColor: `${member.color}20`, color: member.color }}>
                                {member.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{member.name}</span>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                <Button
                  variant="outline"
                  className="w-full text-xs"
                  size="sm"
                  onClick={() => router.push("/ai-family/tasks")}
                >
                  View All Tasks
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Scheduled events across all AI Family members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allEvents
                  .filter((event) => new Date(event.startTime) > new Date())
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .slice(0, 5)
                  .map((event) => {
                    const member = AI_FAMILY_MEMBERS.find((m) => m.schedule.some((e) => e.id === event.id))!
                    return (
                      <div key={event.id} className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium">{event.title}</p>
                            {event.recurring && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Recurring
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={member.avatarUrl} alt={member.name} />
                              <AvatarFallback style={{ backgroundColor: `${member.color}20`, color: member.color }}>
                                {member.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{member.name}</span>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(event.startTime).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                <Button
                  variant="outline"
                  className="w-full text-xs"
                  size="sm"
                  onClick={() => router.push("/ai-family/schedule")}
                >
                  View All Events
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
