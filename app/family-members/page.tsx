"use client"

import { FamilyMemberManager } from "@/components/family-members/family-member-manager"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function FamilyMembersPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">AI Family Members</h1>
      </div>

      <div className="mb-6">
        <p className="text-muted-foreground">
          Create and manage AI family members with their own personalities and memories. Each family member has their
          own vector store for personalized interactions.
        </p>
      </div>

      <FamilyMemberManager />
    </div>
  )
}
