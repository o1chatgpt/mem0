"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Edit, Plus, Trash2, Volume2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type AIFamilyMember = {
  id: string
  name: string
  specialty: string
  description: string
  avatar_url?: string
  color?: string
  model?: string
  role?: string
}

export default function AIFamilyPage() {
  const [members, setMembers] = useState<AIFamilyMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch AI family members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/admin/ai-family")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch AI family members")
        }

        setMembers(data.members || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembers()
  }, [])

  const deleteMember = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/ai-family/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete AI family member")
      }

      // Update local state
      setMembers(members.filter((member) => member.id !== id))
      setMemberToDelete(null)

      toast({
        title: "Member Deleted",
        description: "AI family member has been deleted successfully.",
      })
    } catch (err) {
      toast({
        title: "Deletion Failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
            <p className="mt-2">Loading AI family members...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">AI Family Members</h1>
          <Link href="/admin/ai-family/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Member
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <div className="h-2" style={{ backgroundColor: member.color || "#4f46e5" }}></div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{member.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/ai-family/${member.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setMemberToDelete(member.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete AI Family Member</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete {member.name}? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setMemberToDelete(null)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={() => deleteMember(member.id)}>
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <CardDescription>{member.role || member.specialty}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url || "/placeholder.svg"}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold">{member.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm">{member.description?.substring(0, 100)}...</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{member.specialty}</Badge>
                  {member.model && <Badge variant="outline">{member.model}</Badge>}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Volume2 className="h-3 w-3" />
                    <span>Voice Enabled</span>
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/admin/ai-family/${member.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {members.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No AI Family Members Found</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first AI family member.</p>
            <Link href="/admin/ai-family/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Member
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
