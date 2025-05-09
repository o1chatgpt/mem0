"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  Clock,
  Download,
  FileText,
  Plus,
  RefreshCw,
  Trash2,
  Mail,
  Check,
  X,
  AlertTriangle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ExportSchedulesManagerProps {
  userId: number
}

export function ExportSchedulesManager({ userId }: ExportSchedulesManagerProps) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    frequency: "weekly",
    format: "csv",
    includeCategories: true,
    includeTimeline: true,
    emailDelivery: false,
    email: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchSchedules()
  }, [userId])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to fetch real schedules from the API
      const response = await fetch("/api/scheduled-exports", {
        method: "GET",
      })

      if (!response.ok) {
        // If API call fails, use mock schedules
        setMockSchedules()
        return
      }

      const data = await response.json()

      if (data.error) {
        console.warn("Error from API, using mock schedules:", data.error)
        setMockSchedules()
        return
      }

      if (data.schedules) {
        setSchedules(data.schedules)
      } else {
        setMockSchedules()
      }
    } catch (err) {
      console.error("Error fetching export schedules:", err)
      // Fallback to mock schedules on error
      setMockSchedules()
    } finally {
      setLoading(false)
    }
  }

  const setMockSchedules = () => {
    // Mock schedules for demonstration
    setSchedules([
      {
        id: "sched_1",
        name: "Weekly Memory Report",
        frequency: "weekly",
        format: "csv",
        includeCategories: true,
        includeTimeline: true,
        emailDelivery: true,
        email: "user@example.com",
        nextRunAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        lastRunAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "sched_2",
        name: "Monthly Analytics",
        frequency: "monthly",
        format: "json",
        includeCategories: true,
        includeTimeline: true,
        emailDelivery: false,
        email: null,
        nextRunAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        lastRunAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "sched_3",
        name: "Daily Backup",
        frequency: "daily",
        format: "csv",
        includeCategories: false,
        includeTimeline: true,
        emailDelivery: true,
        email: "backup@example.com",
        nextRunAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        lastRunAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: "paused",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ])
  }

  const handleRefresh = () => {
    fetchSchedules()
    toast({
      title: "Refreshing schedules",
      description: "Fetching the latest export schedules",
    })
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCreateSchedule = async () => {
    try {
      // Validate form
      if (!formData.name) {
        toast({
          title: "Validation Error",
          description: "Schedule name is required",
          variant: "destructive",
        })
        return
      }

      if (formData.emailDelivery && !formData.email) {
        toast({
          title: "Validation Error",
          description: "Email address is required for email delivery",
          variant: "destructive",
        })
        return
      }

      // In a real app, we would call the API to create the schedule
      // For now, let's simulate it
      const newSchedule = {
        id: `sched_${Date.now()}`,
        name: formData.name,
        frequency: formData.frequency,
        format: formData.format,
        includeCategories: formData.includeCategories,
        includeTimeline: formData.includeTimeline,
        emailDelivery: formData.emailDelivery,
        email: formData.email,
        nextRunAt: getNextRunDate(formData.frequency),
        lastRunAt: null,
        status: "active",
        createdAt: new Date().toISOString(),
      }

      setSchedules((prev) => [...prev, newSchedule])
      setIsDialogOpen(false)

      // Reset form
      setFormData({
        name: "",
        frequency: "weekly",
        format: "csv",
        includeCategories: true,
        includeTimeline: true,
        emailDelivery: false,
        email: "",
      })

      toast({
        title: "Schedule Created",
        description: "Your export schedule has been created successfully",
      })
    } catch (err) {
      console.error("Error creating schedule:", err)
      toast({
        title: "Error",
        description: "Failed to create export schedule",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSchedule = async () => {
    try {
      if (!selectedScheduleId) return

      // In a real app, we would call the API to delete the schedule
      // For now, let's simulate it
      setSchedules((prev) => prev.filter((schedule) => schedule.id !== selectedScheduleId))
      setIsDeleteDialogOpen(false)
      setSelectedScheduleId(null)

      toast({
        title: "Schedule Deleted",
        description: "Your export schedule has been deleted successfully",
      })
    } catch (err) {
      console.error("Error deleting schedule:", err)
      toast({
        title: "Error",
        description: "Failed to delete export schedule",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (scheduleId: string, currentStatus: string) => {
    try {
      // In a real app, we would call the API to update the schedule status
      // For now, let's simulate it
      const newStatus = currentStatus === "active" ? "paused" : "active"

      setSchedules((prev) =>
        prev.map((schedule) => (schedule.id === scheduleId ? { ...schedule, status: newStatus } : schedule)),
      )

      toast({
        title: `Schedule ${newStatus === "active" ? "Activated" : "Paused"}`,
        description: `Your export schedule has been ${newStatus === "active" ? "activated" : "paused"} successfully`,
      })
    } catch (err) {
      console.error("Error updating schedule status:", err)
      toast({
        title: "Error",
        description: "Failed to update export schedule status",
        variant: "destructive",
      })
    }
  }

  const getNextRunDate = (frequency: string) => {
    const now = new Date()

    switch (frequency) {
      case "daily":
        return new Date(now.setDate(now.getDate() + 1)).toISOString()
      case "weekly":
        return new Date(now.setDate(now.getDate() + 7)).toISOString()
      case "monthly":
        return new Date(now.setMonth(now.getMonth() + 1)).toISOString()
      default:
        return new Date(now.setDate(now.getDate() + 7)).toISOString()
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "Daily"
      case "weekly":
        return "Weekly"
      case "monthly":
        return "Monthly"
      default:
        return frequency
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Exports</CardTitle>
          <CardDescription>Loading your scheduled exports...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-[100px] w-full" />
          <Skeleton className="h-[100px] w-full" />
          <Skeleton className="h-[100px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Exports</CardTitle>
          <CardDescription>There was an error loading your scheduled exports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
            <p className="font-medium">Error loading schedules</p>
            <p>{error}</p>
            <Button variant="outline" className="mt-2" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Scheduled Exports</CardTitle>
          <CardDescription>Manage your automated memory analytics exports</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Export Schedule</DialogTitle>
                <DialogDescription>
                  Set up an automated export schedule for your memory analytics data
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Schedule Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Weekly Memory Report"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={formData.frequency} onValueChange={(value) => handleInputChange("frequency", value)}>
                      <SelectTrigger id="frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="format">Export Format</Label>
                    <Select value={formData.format} onValueChange={(value) => handleInputChange("format", value)}>
                      <SelectTrigger id="format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Include Data</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="includeCategories"
                      checked={formData.includeCategories}
                      onCheckedChange={(checked) => handleInputChange("includeCategories", checked)}
                    />
                    <Label htmlFor="includeCategories">Category Distribution</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="includeTimeline"
                      checked={formData.includeTimeline}
                      onCheckedChange={(checked) => handleInputChange("includeTimeline", checked)}
                    />
                    <Label htmlFor="includeTimeline">Timeline Data</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emailDelivery"
                      checked={formData.emailDelivery}
                      onCheckedChange={(checked) => handleInputChange("emailDelivery", checked)}
                    />
                    <Label htmlFor="emailDelivery">Email Delivery</Label>
                  </div>
                  {formData.emailDelivery && (
                    <div className="pt-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSchedule}>Create Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No export schedules found</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Schedule
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-lg">{schedule.name}</h3>
                      <Badge variant={schedule.status === "active" ? "default" : "secondary"} className="ml-2">
                        {schedule.status === "active" ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <X className="h-3 w-3 mr-1" />
                        )}
                        {schedule.status === "active" ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {getFrequencyLabel(schedule.frequency)} export in {schedule.format.toUpperCase()} format
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(schedule.id, schedule.status)}
                          >
                            {schedule.status === "active" ? "Pause" : "Activate"}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {schedule.status === "active" ? "Pause this schedule" : "Activate this schedule"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedScheduleId(schedule.id)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete this schedule</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Next run:</span>
                      <span className="ml-1 font-medium">{formatDate(schedule.nextRunAt)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Last run:</span>
                      <span className="ml-1">{schedule.lastRunAt ? formatDate(schedule.lastRunAt) : "Never"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Includes:</span>
                      <span className="ml-1">
                        {[
                          schedule.includeCategories ? "Categories" : null,
                          schedule.includeTimeline ? "Timeline" : null,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      {schedule.emailDelivery ? (
                        <>
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-muted-foreground">Email delivery to:</span>
                          <span className="ml-1">{schedule.email}</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Available for download only</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Export Schedule</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this export schedule? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex space-x-2 justify-end">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteSchedule}>
                Delete Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="text-sm text-muted-foreground">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
            <p>
              Email delivery requires valid SMTP settings. Visit the{" "}
              <a href="/api-keys" className="text-blue-500 hover:underline">
                API Keys
              </a>{" "}
              page to configure email settings.
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
