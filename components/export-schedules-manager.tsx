"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@/lib/db"
import { Calendar, Clock, Mail, FileText, FileSpreadsheet, Trash, RefreshCw } from "lucide-react"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

interface ExportSchedulesManagerProps {
  userId: number
}

export function ExportSchedulesManager({ userId }: ExportSchedulesManagerProps) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [aiMembers, setAiMembers] = useState<Record<number, string>>({})
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchSchedules()
    fetchAiMembers()
  }, [userId])

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase
        .from("fm_export_schedules")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setSchedules(data || [])
    } catch (error) {
      console.error("Error fetching schedules:", error)
      toast({
        title: "Error",
        description: "Failed to load export schedules",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAiMembers = async () => {
    try {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase.from("fm_ai_members").select("id, name").eq("user_id", userId)

      if (error) throw error

      const membersMap: Record<number, string> = {}
      data?.forEach((member) => {
        membersMap[member.id] = member.name
      })
      setAiMembers(membersMap)
    } catch (error) {
      console.error("Error fetching AI members:", error)
    }
  }

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const supabase = createClientComponentClient()
      const { error } = await supabase
        .from("fm_export_schedules")
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      setSchedules((prev) =>
        prev.map((schedule) => (schedule.id === id ? { ...schedule, is_active: !currentStatus } : schedule)),
      )

      toast({
        title: `Schedule ${!currentStatus ? "activated" : "paused"}`,
        description: `The export schedule has been ${!currentStatus ? "activated" : "paused"}.`,
      })
    } catch (error) {
      console.error("Error toggling schedule status:", error)
      toast({
        title: "Error",
        description: "Failed to update schedule status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (id: number) => {
    setScheduleToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return

    setIsDeleting(true)
    try {
      const supabase = createClientComponentClient()
      const { error } = await supabase.from("fm_export_schedules").delete().eq("id", scheduleToDelete)

      if (error) throw error

      setSchedules((prev) => prev.filter((schedule) => schedule.id !== scheduleToDelete))
      toast({
        title: "Schedule deleted",
        description: "The export schedule has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting schedule:", error)
      toast({
        title: "Error",
        description: "Failed to delete the schedule",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
      setScheduleToDelete(null)
    }
  }

  const formatScheduleTime = (schedule: any) => {
    const { frequency, day_of_week, day_of_month, hour, minute } = schedule

    const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

    if (frequency === "daily") {
      return `Daily at ${timeStr}`
    } else if (frequency === "weekly") {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      return `Every ${days[day_of_week]} at ${timeStr}`
    } else if (frequency === "monthly") {
      return `Monthly on day ${day_of_month} at ${timeStr}`
    }

    return timeStr
  }

  const formatNextScheduled = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Export Schedules</CardTitle>
        <Button variant="outline" size="sm" onClick={fetchSchedules}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading schedules...</div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No export schedules found. Create a schedule to receive automated exports.
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{schedule.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {schedule.ai_member_id
                        ? `For ${aiMembers[schedule.ai_member_id] || "Unknown AI Member"}`
                        : "For all AI Members"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={schedule.is_active}
                      onCheckedChange={() => handleToggleActive(schedule.id, schedule.is_active)}
                    />
                    <Badge variant={schedule.is_active ? "default" : "secondary"}>
                      {schedule.is_active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatScheduleTime(schedule)}
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    Next: {formatNextScheduled(schedule.next_scheduled)}
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    {schedule.email}
                  </div>
                  <div className="flex items-center text-sm">
                    {schedule.format === "csv" ? (
                      <FileSpreadsheet className="h-4 w-4 mr-2 text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    )}
                    Format: {schedule.format.toUpperCase()}
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(schedule.id)}>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setScheduleToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Export Schedule"
        description="Are you sure you want to delete this export schedule? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        variant="destructive"
      />
    </Card>
  )
}
