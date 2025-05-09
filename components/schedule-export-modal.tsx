"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@/lib/db"

interface ScheduleExportModalProps {
  isOpen: boolean
  onClose: () => void
  userId: number
  aiMemberId?: number | null
}

export function ScheduleExportModal({ isOpen, onClose, userId, aiMemberId }: ScheduleExportModalProps) {
  const [aiMembers, setAiMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    frequency: "weekly",
    dayOfWeek: "1", // Monday
    dayOfMonth: "1",
    hour: "9",
    minute: "0",
    format: "pdf",
    email: "",
    aiMemberId: aiMemberId || "all",
  })

  useEffect(() => {
    if (isOpen) {
      fetchAiMembers()
      // Reset form or set default values
      setFormData({
        name: "",
        frequency: "weekly",
        dayOfWeek: "1", // Monday
        dayOfMonth: "1",
        hour: "9",
        minute: "0",
        format: "pdf",
        email: "",
        aiMemberId: aiMemberId?.toString() || "all",
      })
    }
  }, [isOpen, aiMemberId])

  const fetchAiMembers = async () => {
    try {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase.from("fm_ai_members").select("id, name").eq("user_id", userId)

      if (error) throw error
      setAiMembers(data || [])
    } catch (error) {
      console.error("Error fetching AI members:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const calculateNextScheduled = () => {
    const now = new Date()
    const nextDate = new Date()

    // Set time
    nextDate.setHours(Number.parseInt(formData.hour))
    nextDate.setMinutes(Number.parseInt(formData.minute))
    nextDate.setSeconds(0)
    nextDate.setMilliseconds(0)

    // Adjust date based on frequency
    if (formData.frequency === "daily") {
      // If the time is already past for today, schedule for tomorrow
      if (nextDate <= now) {
        nextDate.setDate(nextDate.getDate() + 1)
      }
    } else if (formData.frequency === "weekly") {
      const dayOfWeek = Number.parseInt(formData.dayOfWeek)
      const currentDay = nextDate.getDay()

      // Calculate days to add to get to the target day of week
      let daysToAdd = dayOfWeek - currentDay
      if (daysToAdd <= 0 || (daysToAdd === 0 && nextDate <= now)) {
        daysToAdd += 7
      }

      nextDate.setDate(nextDate.getDate() + daysToAdd)
    } else if (formData.frequency === "monthly") {
      const dayOfMonth = Number.parseInt(formData.dayOfMonth)

      // Set to the specified day of the current month
      nextDate.setDate(dayOfMonth)

      // If that day has already passed this month or doesn't exist, move to next month
      if (nextDate <= now || nextDate.getDate() !== dayOfMonth) {
        nextDate.setDate(1) // Reset to first day of month
        nextDate.setMonth(nextDate.getMonth() + 1) // Move to next month
        nextDate.setDate(dayOfMonth) // Try to set the day again

        // Handle case where the day doesn't exist in the next month either
        if (nextDate.getDate() !== dayOfMonth) {
          // Set to the last day of the previous month
          nextDate.setDate(0)
        }
      }
    }

    return nextDate
  }

  const getDayInfo = () => {
    if (formData.frequency === "weekly") {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      return days[Number.parseInt(formData.dayOfWeek)]
    } else if (formData.frequency === "monthly") {
      const day = Number.parseInt(formData.dayOfMonth)

      // Add ordinal suffix
      let suffix = "th"
      if (day === 1 || day === 21 || day === 31) suffix = "st"
      else if (day === 2 || day === 22) suffix = "nd"
      else if (day === 3 || day === 23) suffix = "rd"

      return `${day}${suffix}`
    }
    return ""
  }

  const getTimeInfo = () => {
    const hour = Number.parseInt(formData.hour)
    const minute = Number.parseInt(formData.minute)

    // Format as 12-hour time
    const period = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    const displayMinute = minute.toString().padStart(2, "0")

    return `${displayHour}:${displayMinute} ${period}`
  }

  const sendConfirmationEmail = async (scheduleId: number, nextScheduled: Date) => {
    try {
      // Get AI member name if applicable
      let aiMemberName
      if (formData.aiMemberId !== "all") {
        const aiMember = aiMembers.find((m) => m.id.toString() === formData.aiMemberId)
        aiMemberName = aiMember?.name
      }

      // Prepare data for confirmation email
      const confirmationData = {
        scheduleId,
        scheduleName: formData.name,
        frequency: formData.frequency as "daily" | "weekly" | "monthly",
        dayInfo: getDayInfo(),
        timeInfo: getTimeInfo(),
        format: formData.format as "pdf" | "csv",
        firstExportDate: nextScheduled.toLocaleString(),
        email: formData.email,
        aiMember: aiMemberName,
      }

      // Send confirmation email
      await fetch("/api/send-schedule-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(confirmationData),
      })
    } catch (error) {
      console.error("Error sending confirmation email:", error)
      // Don't throw - we don't want to fail the schedule creation if email fails
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing information",
        description: "Please provide a name and email address for the scheduled export.",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please provide a valid email address.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const nextScheduled = calculateNextScheduled()

      const supabase = createClientComponentClient()
      const { data, error } = await supabase
        .from("fm_export_schedules")
        .insert({
          user_id: userId,
          ai_member_id:
            formData.aiMemberId && formData.aiMemberId !== "all" ? Number.parseInt(formData.aiMemberId) : null,
          name: formData.name,
          frequency: formData.frequency,
          day_of_week: formData.frequency === "weekly" ? Number.parseInt(formData.dayOfWeek) : null,
          day_of_month: formData.frequency === "monthly" ? Number.parseInt(formData.dayOfMonth) : null,
          hour: Number.parseInt(formData.hour),
          minute: Number.parseInt(formData.minute),
          format: formData.format,
          email: formData.email,
          next_scheduled: nextScheduled.toISOString(),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      // Send confirmation email
      if (data && data.length > 0) {
        await sendConfirmationEmail(data[0].id, nextScheduled)
      }

      toast({
        title: "Schedule created",
        description: "Your export schedule has been created successfully. A confirmation email has been sent.",
      })
      onClose()
    } catch (error) {
      console.error("Error creating schedule:", error)
      toast({
        title: "Error",
        description: "There was an error creating your schedule. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Automated Exports</DialogTitle>
          <DialogDescription>Set up recurring exports of memory analytics to be sent to your email.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Schedule Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Weekly Analytics Report"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-member">AI Family Member (Optional)</Label>
            <Select
              value={formData.aiMemberId.toString()}
              onValueChange={(value) => handleSelectChange("aiMemberId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All AI Members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All AI Members</SelectItem>
                {aiMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <RadioGroup
              value={formData.frequency}
              onValueChange={(value) => handleSelectChange("frequency", value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">Monthly</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.frequency === "weekly" && (
            <div className="space-y-2">
              <Label htmlFor="day-of-week">Day of Week</Label>
              <Select value={formData.dayOfWeek} onValueChange={(value) => handleSelectChange("dayOfWeek", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.frequency === "monthly" && (
            <div className="space-y-2">
              <Label htmlFor="day-of-month">Day of Month</Label>
              <Select value={formData.dayOfMonth} onValueChange={(value) => handleSelectChange("dayOfMonth", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Day" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hour">Hour</Label>
              <Select value={formData.hour} onValueChange={(value) => handleSelectChange("hour", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minute">Minute</Label>
              <Select value={formData.minute} onValueChange={(value) => handleSelectChange("minute", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Minute" />
                </SelectTrigger>
                <SelectContent>
                  {[0, 15, 30, 45].map((minute) => (
                    <SelectItem key={minute} value={minute.toString()}>
                      {minute.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Export Format</Label>
            <RadioGroup
              value={formData.format}
              onValueChange={(value) => handleSelectChange("format", value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">PDF</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
