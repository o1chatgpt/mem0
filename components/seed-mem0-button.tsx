"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface SeedMem0ButtonProps {
  setSeedFinished?: (value: boolean) => void
}

export function SeedMem0Button({ setSeedFinished }: SeedMem0ButtonProps) {
  const [isSeeding, setIsSeeding] = useState(false)
  const { toast } = useToast()

  async function seedMem0Memories() {
    setIsSeeding(true)
    try {
      const response = await fetch("/api/seed-mem0-memories")
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Mem0 memories seeded successfully",
        })
        if (setSeedFinished) {
          setSeedFinished(true)
        }
      } else {
        throw new Error(data.error || "Failed to seed Mem0 memories")
      }
    } catch (error) {
      console.error("Error seeding Mem0 memories:", error)
      toast({
        title: "Error",
        description: "Failed to seed Mem0 memories",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <Button onClick={seedMem0Memories} disabled={isSeeding} className="w-full">
      {isSeeding ? "Seeding Mem0 Memories..." : "Seed Sample Memories"}
    </Button>
  )
}
