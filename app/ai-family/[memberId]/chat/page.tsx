"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Mem0Chat } from "@/components/mem0-chat"
import { createClientComponentClient } from "@/lib/db"

export default function AiFamilyMemberChatPage({ params }: { params: { memberId: string } }) {
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMember = async () => {
      setLoading(true)
      const supabase = createClientComponentClient()

      const { data, error } = await supabase.from("fm_ai_members").select("*").eq("id", params.memberId).single()

      if (data && !error) {
        setMember(data)
      } else {
        console.error("Error fetching AI family member:", error)
      }

      setLoading(false)
    }

    fetchMember()
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
        <div className="flex items-center">
          <Link href={`/ai-family/${params.memberId}`}>
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {member.name}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Chat with {member.name}</h1>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="bg-muted p-4 rounded-lg">
          <p className="font-medium">Role: {member.role}</p>
          <p className="font-medium">Specialty: {member.specialty}</p>
          <p className="mt-2">{member.description}</p>
        </div>

        <Mem0Chat userId={member.user_id} aiMemberId={member.id} />
      </div>
    </div>
  )
}
