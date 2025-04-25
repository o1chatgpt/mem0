"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, MessageSquare, Trash } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from "@/lib/db"
import type { Memory } from "@/lib/mem0"

export default function AiFamilyMemberPage({ params }: { params: { memberId: string } }) {
  const [member, setMember] = useState<any>(null)
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const supabase = createClientComponentClient()

      // Fetch member details
      const { data: memberData, error: memberError } = await supabase
        .from("fm_ai_members")
        .select("*")
        .eq("id", params.memberId)
        .single()

      if (memberData && !memberError) {
        setMember(memberData)

        // Fetch memories for this member
        const { data: memoriesData, error: memoriesError } = await supabase
          .from("fm_memories")
          .select("*")
          .eq("ai_member_id", params.memberId)
          .order("created_at", { ascending: false })
          .limit(5)

        if (memoriesData && !memoriesError) {
          setMemories(memoriesData as Memory[])
        } else {
          console.error("Error fetching memories:", memoriesError)
        }
      } else {
        console.error("Error fetching AI family member:", memberError)
      }

      setLoading(false)
    }

    fetchData()
  }, [params.memberId])

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-2">AI Family Member Not Found</h2>
            <p>The requested AI family member could not be found.</p>
            <Link href="/ai-family">
              <Button className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to AI Family
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/ai-family">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AI Family
          </Button>
        </Link>
        <div className="flex space-x-2">
          <Link href={`/ai-family/${params.memberId}/chat`}>
            <Button variant="outline" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{member.name}</CardTitle>
          <CardDescription>
            {member.role} • {member.specialty}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Description</h3>
              <p className="text-gray-500">{member.description}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Created</h3>
              <p className="text-gray-500">{new Date(member.created_at).toLocaleDateString()}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium">Recent Memories</h3>
              {memories.length === 0 ? (
                <p className="text-gray-500">No memories stored yet.</p>
              ) : (
                <div className="space-y-2 mt-2">
                  {memories.map((memory) => (
                    <div key={memory.id} className="p-3 bg-muted rounded-md">
                      <p>{memory.content}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(memory.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
