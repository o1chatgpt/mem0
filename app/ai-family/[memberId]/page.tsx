"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AIFamilySidebar } from "@/components/ai-family-sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAIFamilyMember, type AIFamilyMember } from "@/data/ai-family-members"
import {
  MessageSquare,
  Code,
  Calendar,
  CheckSquare,
  Settings,
  Edit,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CeciliaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [member, setMember] = useState<AIFamilyMember | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Check if user is admin
    setIsAdmin(localStorage.getItem("userRole") === "admin")

    // Get member data
    const memberData = getAIFamilyMember(params.id)
    if (memberData) {
      setMember(memberData)
    } else {
      toast({
        title: "Member not found",
        description: "The requested AI Family member could not be found.",
        variant: "destructive",
      })
      router.push("/ai-family")
    }
  }, [params.id, router, toast])

  if (!member) {
    return (
      <div className="flex h-screen">
        <AIFamilySidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading AI Family member...</p>
          </div>
        </div>
      </div>
    )
  }

  const handleEditMember = () => {
    if (isAdmin) {
      router.push(`/ai-family/${member.id}/edit`)
    } else {
      toast({
        title: "Permission Denied",
        description: "Only administrators can edit AI Family members.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-screen">
      <AIFamilySidebar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2" style={{ borderColor: member.color }}>
              <AvatarImage src={member.avatarUrl || "/placeholder.svg"} alt={member.name} />
              <AvatarFallback style={{ backgroundColor: `${member.color}20`, color: member.color }}>
                {member.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{member.name}</h1>
              <p className="text-muted-foreground">{member.specialty}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={member.isActive ? "default" : "outline"}>
                  {member.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">Model: {member.model}</Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/ai-family/${member.id}/chat`)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
            {isAdmin && (
              <Button variant="outline" onClick={handleEditMember}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            <Button onClick={() => router.push(`/ai-family/${member.id}/assign`)}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Assign Task
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="overview">
              <Code className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <CheckSquare className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>About {member.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{member.description}</p>

                  <h3 className="font-semibold mb-2">Capabilities</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {member.capabilities.map((capability) => (
                      <Badge key={capability} variant="outline">
                        {capability}
                      </Badge>
                    ))}
                  </div>

                  <h3 className="font-semibold mb-2">System Prompt</h3>
                  <div className="bg-muted p-3 rounded-md text-sm">{member.systemPrompt}</div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Model Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Primary Model</span>
                        <span className="font-medium">{member.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fallback Model</span>
                        <span className="font-medium">{member.fallbackModel}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Tasks</span>
                        <span className="font-medium">
                          {member.tasks.filter((t) => t.status === "in-progress").length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Completed Tasks</span>
                        <span className="font-medium">
                          {member.tasks.filter((t) => t.status === "completed").length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Upcoming Events</span>
                        <span className="font-medium">
                          {member.schedule.filter((s) => new Date(s.startTime) > new Date()).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full" onClick={() => router.push(`/ai-family/${member.id}/performance`)}>
                  View Performance Analytics
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Tasks</h2>
              <Button onClick={() => router.push(`/ai-family/${member.id}/assign`)}>
                <CheckSquare className="h-4 w-4 mr-2" />
                Assign New Task
              </Button>
            </div>

            {member.tasks.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-1">No Tasks Assigned</h3>
                <p className="text-muted-foreground">{member.name} doesn't have any tasks assigned yet.</p>
                <Button className="mt-4" onClick={() => router.push(`/ai-family/${member.id}/assign`)}>
                  Assign First Task
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {member.tasks.map((task) => (
                  <Card key={task.id} className="overflow-hidden">
                    <div
                      className={cn(
                        "h-1",
                        task.status === "completed" && "bg-green-500",
                        task.status === "in-progress" && "bg-blue-500",
                        task.status === "pending" && "bg-yellow-500",
                        task.status === "cancelled" && "bg-red-500",
                      )}
                    ></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle>{task.title}</CardTitle>
                        <Badge
                          variant="outline"
                          className={cn(
                            task.status === "completed" &&
                              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                            task.status === "in-progress" &&
                              "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                            task.status === "pending" &&
                              "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
                            task.status === "cancelled" && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
                          )}
                        >
                          {task.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted">Priority: {task.priority}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{task.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(task.createdAt).toLocaleDateString()}
                          {task.assignedBy && ` • Assigned by: ${task.assignedBy}`}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/ai-family/${member.id}/tasks/${task.id}`)}
                          >
                            View Details
                          </Button>
                          {task.status === "in-progress" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                              onClick={() => router.push(`/ai-family/${member.id}/tasks/${task.id}/complete`)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Schedule</h2>
              <Button onClick={() => router.push(`/ai-family/${member.id}/schedule/add`)}>
                <Calendar className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>

            {member.schedule.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-1">No Events Scheduled</h3>
                <p className="text-muted-foreground">{member.name} doesn't have any events scheduled yet.</p>
                <Button className="mt-4" onClick={() => router.push(`/ai-family/${member.id}/schedule/add`)}>
                  Schedule First Event
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {member.schedule.map((event) => (
                  <Card key={event.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle>{event.title}</CardTitle>
                        {event.recurring && <Badge variant="outline">Recurring {event.recurringPattern}</Badge>}
                      </div>
                      <CardDescription>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {new Date(event.startTime).toLocaleDateString()} •
                          {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -
                          {new Date(event.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{event.description}</p>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/ai-family/${member.id}/schedule/${event.id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/ai-family/${member.id}/schedule/${event.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {isAdmin && (
            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Family Member Settings</CardTitle>
                  <CardDescription>
                    Configure settings for {member.name}. These settings are only visible to administrators.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Status</h3>
                    <div className="flex items-center gap-4">
                      <Button
                        variant={member.isActive ? "default" : "outline"}
                        className={member.isActive ? "bg-green-600 hover:bg-green-700" : ""}
                        onClick={() =>
                          toast({
                            title: "Status Updated",
                            description: `${member.name} is now active.`,
                          })
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Active
                      </Button>
                      <Button
                        variant={!member.isActive ? "default" : "outline"}
                        className={!member.isActive ? "bg-red-600 hover:bg-red-700" : ""}
                        onClick={() =>
                          toast({
                            title: "Status Updated",
                            description: `${member.name} is now inactive.`,
                          })
                        }
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Inactive
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Danger Zone</h3>
                    <div className="border border-red-200 rounded-md p-4 bg-red-50 dark:bg-red-950 dark:border-red-900">
                      <h4 className="font-medium flex items-center text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Danger Zone
                      </h4>
                      <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                        Actions in this section can have serious consequences.
                      </p>
                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to reset ${member.name}? This will clear all tasks and schedule.`,
                              )
                            ) {
                              toast({
                                title: "Member Reset",
                                description: `${member.name} has been reset successfully.`,
                              })
                            }
                          }}
                        >
                          Reset Member
                        </Button>
                        <Button
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => {
                            if (
                              confirm(`Are you sure you want to delete ${member.name}? This action cannot be undone.`)
                            ) {
                              toast({
                                title: "Member Deleted",
                                description: `${member.name} has been deleted successfully.`,
                              })
                              router.push("/ai-family")
                            }
                          }}
                        >
                          Delete Member
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

// Helper function for class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
