"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function SeedMemoriesButton() {
  const [isSeeding, setIsSeeding] = useState(false)
  const { toast } = useToast()

  async function seedMemories() {
    setIsSeeding(true)
    try {
      const response = await fetch("/api/seed-memories")
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Memories seeded successfully",
        })
      } else {
        throw new Error(data.error || "Failed to seed memories")
      }
    } catch (error) {
      console.error("Error seeding memories:", error)
      toast({
        title: "Error",
        description: "Failed to seed memories",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <Button onClick={seedMemories} disabled={isSeeding}>
      {isSeeding ? "Seeding Memories..." : "Seed Sample Memories"}
    </Button>
  )
}
