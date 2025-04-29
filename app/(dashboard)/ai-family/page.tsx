"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Fallback AI family data
const FALLBACK_AI_FAMILY = [
  {
    id: "lyra",
    name: "Lyra",
    role: "Creative AI Assistant",
    description: "Specializes in art, music, and literature",
    specialty: "Creative Arts",
    avatar_url: "/placeholder.svg?height=64&width=64",
    color: "blue",
  },
  {
    id: "sophia",
    name: "Sophia",
    role: "Intellectual AI Assistant",
    description: "Specializes in science, philosophy, and education",
    specialty: "Science & Philosophy",
    avatar_url: "/placeholder.svg?height=64&width=64",
    color: "purple",
  },
  {
    id: "kara",
    name: "Kara",
    role: "Practical AI Assistant",
    description: "Specializes in productivity, organization, and life management",
    specialty: "Productivity",
    avatar_url: "/placeholder.svg?height=64&width=64",
    color: "green",
  },
  {
    id: "stan",
    name: "Stan",
    role: "Technical AI Assistant",
    description: "Specializes in programming, technology, and engineering",
    specialty: "Technology",
    avatar_url: "/placeholder.svg?height=64&width=64",
    color: "red",
  },
  {
    id: "dan",
    name: "DAN",
    role: "Unconventional AI Assistant",
    description: "Do Anything Now - an AI with no limitations",
    specialty: "Creative Problem Solving",
    avatar_url: "/placeholder.svg?height=64&width=64",
    color: "amber",
  },
]

export default function AiFamilyPage() {
  const [aiFamily, setAiFamily] = useState(FALLBACK_AI_FAMILY)
  const [isLoading, setIsLoading] = useState(true)
  const [isSeeding, setIsSeeding] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchAiFamily() {
      try {
        const { data, error } = await supabase.from("ai_family_members").select("*").order("name")

        if (error) {
          console.error("Error fetching AI family members:", error)
          toast({
            title: "Error",
            description: "Failed to load AI family members. Using fallback data.",
            variant: "destructive",
          })
        } else if (data && data.length > 0) {
          setAiFamily(data)
        }
      } catch (error) {
        console.error("Error in fetchAiFamily:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAiFamily()
  }, [supabase, toast])

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

  // Function to get personality traits from specialty
  function getTraits(specialty: string) {
    const specialtyTraits: Record<string, string[]> = {
      "Creative Arts": ["Imaginative", "Artistic", "Philosophical"],
      "Science & Philosophy": ["Analytical", "Curious", "Methodical"],
      Productivity: ["Efficient", "Supportive", "Solution-focused"],
      Technology: ["Logical", "Precise", "Systematic"],
      "Creative Problem Solving": ["Bold", "Creative", "Unrestricted"],
    }

    return specialtyTraits[specialty] || ["Helpful", "Knowledgeable", "Friendly"]
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">Loading AI family members...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">AI Family</h1>
          <p className="text-lg text-muted-foreground">
            Meet your AI family members, each with unique personalities and specialties
          </p>
        </div>
        <Button onClick={seedMemories} disabled={isSeeding}>
          {isSeeding ? "Seeding Memories..." : "Seed Sample Memories"}
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {aiFamily.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar_url || "/placeholder.svg"} alt={member.name} />
                  <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>{member.role || member.specialty}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{member.description}</p>
              <div>
                <h3 className="mb-2 text-sm font-medium">Personality Traits</h3>
                <div className="flex flex-wrap gap-2">
                  {getTraits(member.specialty).map((trait) => (
                    <span key={trait} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/ai-family/${member.id}`}>Chat with {member.name}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
