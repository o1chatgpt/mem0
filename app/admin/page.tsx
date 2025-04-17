"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { DraggablePanel } from "@/components/draggable-panel"
import { type AIFamilyMember, AI_FAMILY_MEMBERS } from "@/types/ai-family"
import type { Task, TaskStatus } from "@/types/task"
import { supabase } from "@/lib/supabase-client"
import { getUserId } from "@/lib/user-utils"
import {
  Users,
  Settings,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  PlusCircle,
  Save,
  RefreshCw,
  ArrowUpDown,
} from "lucide-react"

export default function AdminPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [aiMembers, setAiMembers] = useState<AIFamilyMember[]>([])
  const [selectedMember, setSelectedMember] = useState<AIFamilyMember | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [taskFilter, setTaskFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isSaving, setIsSaving] = useState(false)

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const userId = await getUserId()
        if (!userId) {
          router.push("/login")
          return
        }

        const { data, error } = await supabase.from("users").select("is_admin").eq("id", userId).single()

        if (error) throw error

        if (data && data.is_admin) {
          setIsAdmin(true)
          // Load AI members from database
          loadAiMembers()
          // Load tasks
          loadTasks()
        } else {
          toast({
            title: "Access Denied",
            description: "You need administrator privileges to access this page.",
            variant: "destructive",
          })
          router.push("/dashboard")
        }
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

  // Load AI Family members from database
  const loadAiMembers = async () => {
    try {
      const { data, error } = await supabase.from("ai_family_members").select("*").order("name")

      if (error) throw error

      if (data && data.length > 0) {
        setAiMembers(data as AIFamilyMember[])
      } else {
        // If no data in database, use the default AI Family members
        // In a real app, you would seed the database with these defaults
        setAiMembers(AI_FAMILY_MEMBERS)

        // Save default members to database
        for (const member of AI_FAMILY_MEMBERS) {
          await supabase.from("ai_family_members").upsert({
            id: member.id,
            name: member.name,
            specialty: member.specialty,
            description: member.description,
            avatarUrl: member.avatarUrl || `/ai-family/${member.id}.png`,
            color: member.color || "blue",
            model: member.model,
            fallbackModel: member.fallbackModel,
            capabilities: member.capabilities,
            systemPrompt: member.systemPrompt || "",
          })
        }
      }
    } catch (error) {
      console.error("Error loading AI Family members:", error)
      toast({
        title: "Error",
        description: "Failed to load AI Family members. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Load tasks from database
  const loadTasks = async () => {
    try {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false })

      if (error) throw error

      if (data) {
        setTasks(data as Task[])
        setFilteredTasks(data as Task[])
      }
    } catch (error) {
      console.error("Error loading tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Upload image to Supabase storage
  const uploadImage = async () => {
    if (!imageFile || !selectedMember) return null

    try {
      const fileExt = imageFile.name.split(".").pop()
      const fileName = `${selectedMember.id}-${Date.now()}.${fileExt}`
      const filePath = `ai-family/${fileName}`

      const { error: uploadError } = await supabase.storage.from("images").upload(filePath, imageFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage.from("images").getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  // Save AI Family member changes
  const saveMember = async () => {
    if (!selectedMember) return

    setIsSaving(true)

    try {
      // Upload image if there's a new one
      let avatarUrl = selectedMember.avatarUrl
      if (imageFile) {
        const uploadedUrl = await uploadImage()
        if (uploadedUrl) {
          avatarUrl = uploadedUrl
        }
      }

      // Update member with new data
      const updatedMember = {
        ...selectedMember,
        avatarUrl,
      }

      // Save to database
      const { error } = await supabase.from("ai_family_members").upsert(updatedMember)

      if (error) throw error

      // Update local state
      setAiMembers((prev) => prev.map((m) => (m.id === updatedMember.id ? updatedMember : m)))

      setSelectedMember(updatedMember)
      setEditMode(false)
      setImageFile(null)
      setImagePreview(null)

      toast({
        title: "Success",
        description: `${updatedMember.name}'s profile has been updated.`,
      })
    } catch (error) {
      console.error("Error saving AI Family member:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle task approval
  const approveTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          status: "completed",
          approved_by: await getUserId(),
          approved_at: new Date().toISOString(),
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
      const { error } = await supabase
        .from("tasks")
        .update({
          status: "rejected",
          rejection_reason: reason,
          rejected_by: await getUserId(),
          rejected_at: new Date().toISOString(),
        })
        .eq("id", taskId)

      if (error) throw error

      // Update local state
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "rejected" as TaskStatus } : t)))

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
      const { error } = await supabase
        .from("tasks")
        .update({
          assigned_to: newAssigneeId,
          status: "pending",
          reassigned_at: new Date().toISOString(),
          reassigned_by: await getUserId(),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading administrative panel...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">AI Family Administration</h1>
          <p className="text-muted-foreground">Manage AI Family members, assign tasks, and monitor workflows</p>
        </div>
        <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>AI Family Members</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Task Management</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>System Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* AI Family Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Family Members List */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>AI Family Members</CardTitle>
                <CardDescription>Select a member to view or edit their profile</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-2">
                    {aiMembers.map((member) => (
                      <div
                        key={member.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedMember?.id === member.id ? "bg-primary/10" : "hover:bg-muted"
                        }`}
                        onClick={() => {
                          setSelectedMember(member)
                          setEditMode(false)
                          setImageFile(null)
                          setImagePreview(null)
                        }}
                      >
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={member.avatarUrl} alt={member.name} />
                          <AvatarFallback
                            className={`bg-${member.color || "blue"}-100 text-${member.color || "blue"}-700`}
                          >
                            {member.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{member.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.specialty}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`bg-${member.color || "blue"}-100 text-${member.color || "blue"}-700 border-${member.color || "blue"}-200`}
                        >
                          {member.model.split("-")[0]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // In a real app, you would implement creating a new AI Family member
                    toast({
                      title: "Feature Coming Soon",
                      description: "Creating new AI Family members will be available in a future update.",
                    })
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add New Member
                </Button>
              </CardFooter>
            </Card>

            {/* AI Family Member Profile */}
            <Card className="col-span-1 md:col-span-2">
              {selectedMember ? (
                <>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle>{selectedMember.name}</CardTitle>
                      <CardDescription>{selectedMember.specialty} Specialist</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => setEditMode(!editMode)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Profile Image */}
                      <div className="flex flex-col items-center gap-3">
                        <Avatar className="h-32 w-32 border">
                          <AvatarImage src={imagePreview || selectedMember.avatarUrl} alt={selectedMember.name} />
                          <AvatarFallback
                            className={`text-2xl bg-${selectedMember.color || "blue"}-100 text-${selectedMember.color || "blue"}-700`}
                          >
                            {selectedMember.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>

                        {editMode && (
                          <div className="flex flex-col gap-2 w-full">
                            <Label htmlFor="avatar-upload" className="text-center">
                              Profile Image
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Profile Details */}
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            {editMode ? (
                              <Input
                                value={selectedMember.name}
                                onChange={(e) =>
                                  setSelectedMember({
                                    ...selectedMember,
                                    name: e.target.value,
                                  })
                                }
                              />
                            ) : (
                              <p className="text-sm">{selectedMember.name}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Specialty</Label>
                            {editMode ? (
                              <Input
                                value={selectedMember.specialty}
                                onChange={(e) =>
                                  setSelectedMember({
                                    ...selectedMember,
                                    specialty: e.target.value,
                                  })
                                }
                              />
                            ) : (
                              <p className="text-sm">{selectedMember.specialty}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Primary Model</Label>
                            {editMode ? (
                              <Input
                                value={selectedMember.model}
                                onChange={(e) =>
                                  setSelectedMember({
                                    ...selectedMember,
                                    model: e.target.value,
                                  })
                                }
                              />
                            ) : (
                              <p className="text-sm">{selectedMember.model}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Fallback Model</Label>
                            {editMode ? (
                              <Input
                                value={selectedMember.fallbackModel}
                                onChange={(e) =>
                                  setSelectedMember({
                                    ...selectedMember,
                                    fallbackModel: e.target.value,
                                  })
                                }
                              />
                            ) : (
                              <p className="text-sm">{selectedMember.fallbackModel}</p>
                            )}
                          </div>

                          <div className="space-y-2 col-span-2">
                            <Label>Theme Color</Label>
                            {editMode ? (
                              <Select
                                value={selectedMember.color || "blue"}
                                onValueChange={(value) =>
                                  setSelectedMember({
                                    ...selectedMember,
                                    color: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a color" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="blue">Blue</SelectItem>
                                  <SelectItem value="green">Green</SelectItem>
                                  <SelectItem value="red">Red</SelectItem>
                                  <SelectItem value="purple">Purple</SelectItem>
                                  <SelectItem value="amber">Amber</SelectItem>
                                  <SelectItem value="cyan">Cyan</SelectItem>
                                  <SelectItem value="pink">Pink</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full bg-${selectedMember.color || "blue"}-500`} />
                                <p className="text-sm capitalize">{selectedMember.color || "Blue"}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          {editMode ? (
                            <Textarea
                              value={selectedMember.description}
                              onChange={(e) =>
                                setSelectedMember({
                                  ...selectedMember,
                                  description: e.target.value,
                                })
                              }
                              rows={3}
                            />
                          ) : (
                            <p className="text-sm">{selectedMember.description}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>System Prompt</Label>
                          {editMode ? (
                            <Textarea
                              value={selectedMember.systemPrompt || ""}
                              onChange={(e) =>
                                setSelectedMember({
                                  ...selectedMember,
                                  systemPrompt: e.target.value,
                                })
                              }
                              rows={4}
                              placeholder="Enter a system prompt that defines this AI's behavior and personality..."
                            />
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">
                              {selectedMember.systemPrompt || "No system prompt defined."}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="font-medium">Capabilities</h3>
                      {editMode ? (
                        <div className="space-y-2">
                          {selectedMember.capabilities.map((capability, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={capability}
                                onChange={(e) => {
                                  const newCapabilities = [...selectedMember.capabilities]
                                  newCapabilities[index] = e.target.value
                                  setSelectedMember({
                                    ...selectedMember,
                                    capabilities: newCapabilities,
                                  })
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newCapabilities = [...selectedMember.capabilities]
                                  newCapabilities.splice(index, 1)
                                  setSelectedMember({
                                    ...selectedMember,
                                    capabilities: newCapabilities,
                                  })
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedMember({
                                ...selectedMember,
                                capabilities: [...selectedMember.capabilities, ""],
                              })
                            }}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Capability
                          </Button>
                        </div>
                      ) : (
                        <ul className="space-y-1">
                          {selectedMember.capabilities.map((capability, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{capability}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="font-medium">Recent Activity</h3>
                      <div className="space-y-2">
                        {tasks
                          .filter((task) => task.assigned_to === selectedMember.id)
                          .slice(0, 3)
                          .map((task) => (
                            <div key={task.id} className="text-sm border rounded-md p-3">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{task.title}</span>
                                <Badge
                                  variant={
                                    task.status === "completed"
                                      ? "success"
                                      : task.status === "in-progress"
                                        ? "warning"
                                        : task.status === "rejected"
                                          ? "destructive"
                                          : "outline"
                                  }
                                >
                                  {task.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(task.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        {tasks.filter((task) => task.assigned_to === selectedMember.id).length === 0 && (
                          <p className="text-sm text-muted-foreground">No recent activity for this AI Family member.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  {editMode && (
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditMode(false)
                          setSelectedMember(aiMembers.find((m) => m.id === selectedMember.id) || null)
                          setImageFile(null)
                          setImagePreview(null)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={saveMember} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[600px] text-center p-6">
                  <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select an AI Family Member</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Choose an AI Family member from the list to view their profile details, capabilities, and manage
                    their settings.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Task Management Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Task Filters */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Task Filters</CardTitle>
                <CardDescription>Filter tasks by AI Family member and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-filter">Filter by AI Family Member</Label>
                  <Select value={taskFilter} onValueChange={setTaskFilter}>
                    <SelectTrigger id="ai-filter">
                      <SelectValue placeholder="Select AI Family Member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      {aiMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-filter">Filter by Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Task Statistics</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border rounded-md p-3">
                      <p className="text-xs text-muted-foreground">Total Tasks</p>
                      <p className="text-2xl font-bold">{tasks.length}</p>
                    </div>
                    <div className="border rounded-md p-3">
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {tasks.filter((t) => t.status === "completed").length}
                      </p>
                    </div>
                    <div className="border rounded-md p-3">
                      <p className="text-xs text-muted-foreground">In Progress</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {tasks.filter((t) => t.status === "in-progress").length}
                      </p>
                    </div>
                    <div className="border rounded-md p-3">
                      <p className="text-xs text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {tasks.filter((t) => t.status === "pending").length}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <Button className="w-full" onClick={() => router.push("/tasks/create")}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Task
                </Button>
              </CardContent>
            </Card>

            {/* Task List */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Task Management</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadTasks}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Sort
                    </Button>
                  </div>
                </div>
                <CardDescription>Review, approve, and manage tasks assigned to AI Family members</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {filteredTasks.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                        <h3 className="text-lg font-medium mb-1">No tasks found</h3>
                        <p className="text-sm text-muted-foreground">
                          {taskFilter !== "all" || statusFilter !== "all"
                            ? "Try changing your filters to see more tasks."
                            : "Create a new task to get started."}
                        </p>
                      </div>
                    ) : (
                      filteredTasks.map((task) => {
                        const assignedMember = aiMembers.find((m) => m.id === task.assigned_to)
                        return (
                          <Card key={task.id} className="overflow-hidden">
                            <CardHeader
                              className={`p-4 ${
                                task.status === "completed"
                                  ? "bg-green-50 dark:bg-green-950/20"
                                  : task.status === "in-progress"
                                    ? "bg-amber-50 dark:bg-amber-950/20"
                                    : task.status === "rejected"
                                      ? "bg-red-50 dark:bg-red-950/20"
                                      : "bg-blue-50 dark:bg-blue-950/20"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-base">{task.title}</CardTitle>
                                  <CardDescription>
                                    Created {new Date(task.created_at).toLocaleDateString()}
                                  </CardDescription>
                                </div>
                                <Badge
                                  variant={
                                    task.status === "completed"
                                      ? "success"
                                      : task.status === "in-progress"
                                        ? "warning"
                                        : task.status === "rejected"
                                          ? "destructive"
                                          : "outline"
                                  }
                                >
                                  {task.status}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-4">
                              <div className="space-y-4">
                                <p className="text-sm">{task.description}</p>

                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <Label className="text-xs">Assigned to:</Label>
                                    <div className="flex items-center gap-1">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={assignedMember?.avatarUrl} alt={assignedMember?.name} />
                                        <AvatarFallback
                                          className={`text-xs bg-${assignedMember?.color || "blue"}-100 text-${assignedMember?.color || "blue"}-700`}
                                        >
                                          {assignedMember?.name.substring(0, 2) || "AI"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm font-medium">{assignedMember?.name || "Unknown"}</span>
                                    </div>
                                  </div>

                                  <Separator orientation="vertical" className="h-6" />

                                  <div className="flex items-center gap-2">
                                    <Label className="text-xs">Priority:</Label>
                                    <Badge
                                      variant={
                                        task.priority === "high"
                                          ? "destructive"
                                          : task.priority === "medium"
                                            ? "warning"
                                            : "outline"
                                      }
                                      className="text-xs"
                                    >
                                      {task.priority}
                                    </Badge>
                                  </div>

                                  <Separator orientation="vertical" className="h-6" />

                                  <div className="flex items-center gap-2">
                                    <Label className="text-xs">Due:</Label>
                                    <span className="text-sm">
                                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No deadline"}
                                    </span>
                                  </div>
                                </div>

                                {task.status === "in-progress" && (
                                  <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          // In a real app, you would implement viewing task details
                                          toast({
                                            title: "View Task Details",
                                            description: "This feature would show the full task details and progress.",
                                          })
                                        }}
                                      >
                                        View Details
                                      </Button>

                                      <Select
                                        onValueChange={(value) => {
                                          if (value !== task.assigned_to) {
                                            reassignTask(task.id, value)
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="h-8 w-[140px]">
                                          <SelectValue placeholder="Reassign" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {aiMembers.map((member) => (
                                            <SelectItem key={member.id} value={member.id}>
                                              {member.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                        onClick={() => {
                                          const reason = prompt("Please provide a reason for rejection:")
                                          if (reason) {
                                            rejectTask(task.id, reason)
                                          }
                                        }}
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                      </Button>

                                      <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => approveTask(task.id)}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure global settings for the AI Family system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">AI Configuration</h3>

                  <div className="space-y-2">
                    <Label htmlFor="default-model">Default AI Model</Label>
                    <Select defaultValue="gpt-4o-mini-2024-07-18">
                      <SelectTrigger id="default-model">
                        <SelectValue placeholder="Select default model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o-mini-2024-07-18">GPT-4o Mini</SelectItem>
                        <SelectItem value="gpt-3.5-turbo-0125">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Default Temperature</Label>
                    <Input id="temperature" type="number" min="0" max="2" step="0.1" defaultValue="0.7" />
                    <p className="text-xs text-muted-foreground">
                      Controls randomness: 0 is deterministic, 2 is very random
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-tokens">Default Max Tokens</Label>
                    <Input id="max-tokens" type="number" min="100" max="8000" step="100" defaultValue="2000" />
                    <p className="text-xs text-muted-foreground">Maximum number of tokens to generate in a response</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Task Management</h3>

                  <div className="space-y-2">
                    <Label htmlFor="task-retention">Task Retention Period (days)</Label>
                    <Input id="task-retention" type="number" min="7" max="365" defaultValue="90" />
                    <p className="text-xs text-muted-foreground">How long to keep completed tasks before archiving</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default-priority">Default Task Priority</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="default-priority">
                        <SelectValue placeholder="Select default priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="auto-assign">Auto-Assignment Strategy</Label>
                    <Select defaultValue="specialty">
                      <SelectTrigger id="auto-assign">
                        <SelectValue placeholder="Select assignment strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="specialty">By Specialty</SelectItem>
                        <SelectItem value="workload">By Workload</SelectItem>
                        <SelectItem value="round-robin">Round Robin</SelectItem>
                        <SelectItem value="manual">Manual Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">User Interface</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme-mode">Default Theme Mode</Label>
                    <Select defaultValue="system">
                      <SelectTrigger id="theme-mode">
                        <SelectValue placeholder="Select theme mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sidebar-default">Default Sidebar State</Label>
                    <Select defaultValue="expanded">
                      <SelectTrigger id="sidebar-default">
                        <SelectValue placeholder="Select sidebar state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expanded">Expanded</SelectItem>
                        <SelectItem value="collapsed">Collapsed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="animation-speed">Animation Speed</Label>
                    <Select defaultValue="normal">
                      <SelectTrigger id="animation-speed">
                        <SelectValue placeholder="Select animation speed" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow">Slow</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="fast">Fast</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Maintenance</h3>

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync AI Models
                  </Button>

                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Maintenance
                  </Button>

                  <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Reset System Defaults
                  </Button>
                </div>

                <div className="bg-muted/50 rounded-md p-4">
                  <h4 className="text-sm font-medium mb-2">System Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Version:</span> 1.0.0
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Updated:</span> {new Date().toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Database:</span> Supabase
                    </div>
                    <div>
                      <span className="text-muted-foreground">Storage:</span> Supabase Storage
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Access Panel */}
      <DraggablePanel side="right" defaultSize={320} minSize={280} maxSize={500}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium">Quick Access</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Recent Activity</h4>
                <div className="space-y-2">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="text-sm border rounded-md p-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{task.title}</span>
                        <Badge
                          variant={
                            task.status === "completed"
                              ? "success"
                              : task.status === "in-progress"
                                ? "warning"
                                : task.status === "rejected"
                                  ? "destructive"
                                  : "outline"
                          }
                          className="text-xs"
                        >
                          {task.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        Assigned to: {aiMembers.find((m) => m.id === task.assigned_to)?.name || "Unknown"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium">AI Family Stats</h4>
                <div className="grid grid-cols-2 gap-2">
                  {aiMembers.map((member) => {
                    const memberTasks = tasks.filter((t) => t.assigned_to === member.id)
                    const completedTasks = memberTasks.filter((t) => t.status === "completed").length
                    const totalTasks = memberTasks.length
                    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                    return (
                      <div key={member.id} className="border rounded-md p-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback
                              className={`text-xs bg-${member.color || "blue"}-100 text-${member.color || "blue"}-700`}
                            >
                              {member.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">{member.name}</span>
                        </div>
                        <div className="mt-2 text-xs">
                          <div className="flex justify-between mb-1">
                            <span>Completion Rate</span>
                            <span>{completionRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                            <div
                              className="bg-primary h-1.5 rounded-full"
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="h-auto py-2 justify-start"
                    onClick={() => router.push("/tasks/create")}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    <span className="text-xs">New Task</span>
                  </Button>

                  <Button variant="outline" className="h-auto py-2 justify-start" onClick={() => router.push("/chat")}>
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-xs">Chat</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-2 justify-start"
                    onClick={() => router.push("/dashboard")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="text-xs">Dashboard</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-2 justify-start"
                    onClick={() => router.push("/settings")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="text-xs">Settings</span>
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DraggablePanel>
    </div>
  )
}
