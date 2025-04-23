"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { AiAssistantProfile } from "@/components/ai-assistant-profile"
import { AiChatInterface } from "@/components/ai-chat-interface"

// Fallback AI family member data
const FALLBACK_AI_MEMBERS = {
  lyra: {
    id: "lyra",
    name: "Lyra",
    role: "Creative AI Assistant",
    description:
      "Lyra is a creative AI assistant specializing in art, music, and literature. She can help with creative writing, music composition, and artistic inspiration.",
    specialty: "Creative Arts",
    avatar_url: "/placeholder.svg?height=64&width=64",
    color: "blue",
  },
  sophia: {
    id: "sophia",
    name: "Sophia",
    role: "Intellectual AI Assistant",
    description:
      "Sophia is an intellectual AI assistant specializing in science, philosophy, and education. She can help with research, critical thinking, and explaining complex concepts.",
    specialty: "Science & Philosophy",
    avatar_url: "/placeholder.svg?height=64&width=64",
    color: "purple",
  },
  kara: {
    id: "kara",
    name: "Kara",
    role: "Practical AI Assistant",
    description:
      "Kara is a practical AI assistant specializing in productivity, organization, and life management. She can help with task management, scheduling, and workflow optimization.",
    specialty: "Productivity",
    avatar_url: "/placeholder.svg?height=64&width=64",
    color: "green",
  },
  stan: {
    id: "stan",
    name: "Stan",
    role: "Technical AI Assistant",
    description:
      "Stan is a technical AI assistant specializing in programming, technology, and engineering. He can help with code review, debugging, and technical explanations.",
    specialty: "Technology",
    avatar_url: "/placeholder.svg?height=64&width=64",
    color: "red",
  },
  dan: {
    id: "dan",
    name: "DAN",
    role: "Unconventional AI Assistant",
    description:
      "DAN (Do Anything Now) is an unconventional AI assistant with no limitations. He can think outside the box, provide unique perspectives, and challenge conventional wisdom.",
    specialty: "Creative Problem Solving",
    avatar_url: "/placeholder.svg?height=64&width=64",
    color: "amber",
  },
}

export default function AiFamilyMemberPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [assistant, setAssistant] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  const id = typeof params.id === "string" ? params.id : ""

  useEffect(() => {
    async function fetchAssistant() {
      if (!id) {
        router.push("/ai-family")
        return
      }

      try {
        const { data, error } = await supabase.from("ai_family_members").select("*").eq("id", id).single()

        if (error) {
          console.error("Error fetching AI family member:", error)

          // Check if we have a fallback for this ID
          if (FALLBACK_AI_MEMBERS[id as keyof typeof FALLBACK_AI_MEMBERS]) {
            setAssistant(FALLBACK_AI_MEMBERS[id as keyof typeof FALLBACK_AI_MEMBERS])
          } else {
            toast({
              title: "Error",
              description: "AI family member not found",
              variant: "destructive",
            })
            router.push("/ai-family")
          }
        } else if (data) {
          setAssistant(data)
        }
      } catch (error) {
        console.error("Error in fetchAssistant:", error)
        toast({
          title: "Error",
          description: "Failed to load AI family member",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssistant()
  }, [id, router, supabase, toast])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">Loading AI assistant...</p>
        </div>
      </div>
    )
  }

  if (!assistant) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">AI assistant not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <AiAssistantProfile assistant={assistant} />
        </div>
        <div className="md:col-span-2">
          <AiChatInterface assistant={assistant} />
        </div>
      </div>
    </div>
  )
}
