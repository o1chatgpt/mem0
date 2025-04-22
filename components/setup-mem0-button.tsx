"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function SetupMem0Button() {
  const [isSettingUp, setIsSettingUp] = useState(false)
  const { toast } = useToast()

  async function setupMem0() {
    setIsSettingUp(true)
    try {
      const response = await fetch("/api/setup-mem0")
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Mem0 database tables created successfully. The page will refresh automatically.",
        })

        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        throw new Error(data.error || "Failed to set up Mem0 tables")
      }
    } catch (error) {
      console.error("Error setting up Mem0:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set up Mem0 tables",
        variant: "destructive",
      })
    } finally {
      setIsSettingUp(false)
    }
  }

  return (
    <Button onClick={setupMem0} disabled={isSettingUp}>
      {isSettingUp ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Setting Up Mem0...
        </>
      ) : (
        "Setup Mem0 Database"
      )}
    </Button>
  )
}
