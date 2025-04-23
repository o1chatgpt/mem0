"use client"
import { Button } from "@/components/ui/button"
import type React from "react"

import { ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { MemoryAnalytics } from "@/components/memory-analytics"
import { MemoryGrowthPrediction } from "@/components/memory-growth-prediction"
import { useState, useEffect } from "react"
import { createClientComponentClient } from "@/lib/db"
import { ScheduleExportModal } from "@/components/schedule-export-modal"
import { ExportSchedulesManager } from "@/components/export-schedules-manager"

export default function MemoryAnalyticsPage() {
  // In a real app, this would come from authentication
  const userId = 1 // Using the admin user we created in the database
  const [aiMembers, setAiMembers] = useState<any[]>([])
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)
  const [selectedMemberName, setSelectedMemberName] = useState<string>("")
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  useEffect(() => {
    // Fetch AI family members
    const fetchAiMembers = async () => {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase.from("fm_ai_members").select("*").eq("user_id", userId)

      if (data && !error) {
        setAiMembers(data)
      }
    }

    fetchAiMembers()
  }, [])

  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memberId = e.target.value ? Number(e.target.value) : null
    setSelectedMemberId(memberId)

    if (memberId) {
      const member = aiMembers.find((m) => m.id === memberId)
      setSelectedMemberName(member ? member.name : "")
    } else {
      setSelectedMemberName("")
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/mem0-integration">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mem0 Integration
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">
            Memory Analytics
            {selectedMemberName && <span className="text-muted-foreground ml-2 text-xl">for {selectedMemberName}</span>}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setIsScheduleModalOpen(true)}>
            <Clock className="mr-2 h-4 w-4" />
            Schedule Exports
          </Button>
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2"
            value={selectedMemberId || ""}
            onChange={handleMemberChange}
          >
            <option value="">All AI Family Members</option>
            {aiMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        <MemoryAnalytics userId={userId} aiMemberId={selectedMemberId} />
        <MemoryGrowthPrediction userId={userId} aiMemberId={selectedMemberId} />
        <ExportSchedulesManager userId={userId} />
      </div>

      <ScheduleExportModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        userId={userId}
        aiMemberId={selectedMemberId}
      />
    </div>
  )
}
