"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, MessageSquare } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from "@/lib/db"

type AiMember = {
  id: number
  name: string
  role: string
  specialty: string
  description: string | null
  created_at: string
}

export default function AiFamilyPage() {
  const [members, setMembers] = useState<AiMember[]>([])
  const [loading, setLoading] = useState(true)
  const userId = 1 // In a real app, this would come from authentication

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true)
      const supabase = createClientComponentClient()

      const { data, error } = await supabase.from("fm_ai_members").select("*").eq("user_id", userId).order("name")

      if (data && !error) {
        setMembers(data)
      } else {
        console.error("Error fetching AI family members:", error)
      }

      setLoading(false)
    }

    fetchMembers()
  }, [])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">AI Family</h1>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New AI Member
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : members.length === 0 ? (
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold mb-2">No AI Family Members</h2>
          <p className="mb-4">You haven't created any AI family members yet.</p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First AI Member
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <CardTitle>{member.name}</CardTitle>
                <CardDescription>
                  {member.role} • {member.specialty}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 line-clamp-3">{member.description || "No description provided."}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href={`/ai-family/${member.id}`}>
                  <Button variant="outline">View Details</Button>
                </Link>
                <Link href={`/ai-family/${member.id}/chat`}>
                  <Button>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
