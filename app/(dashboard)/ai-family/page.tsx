"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"

// Sample AI family members data
const AI_FAMILY = [
  {
    id: "lyra",
    name: "Lyra",
    role: "Creative AI Assistant",
    description: "Specializes in art, music, and literature",
    traits: ["Imaginative", "Artistic", "Philosophical"],
    avatar: "/placeholder.svg?height=64&width=64",
    fallback: "LY",
  },
  {
    id: "sophia",
    name: "Sophia",
    role: "Intellectual AI Assistant",
    description: "Specializes in science, philosophy, and education",
    traits: ["Analytical", "Curious", "Methodical"],
    avatar: "/placeholder.svg?height=64&width=64",
    fallback: "SO",
  },
  {
    id: "kara",
    name: "Kara",
    role: "Practical AI Assistant",
    description: "Specializes in productivity, organization, and life management",
    traits: ["Efficient", "Supportive", "Solution-focused"],
    avatar: "/placeholder.svg?height=64&width=64",
    fallback: "KA",
  },
  {
    id: "stan",
    name: "Stan",
    role: "Technical AI Assistant",
    description: "Specializes in programming, technology, and engineering",
    traits: ["Logical", "Precise", "Systematic"],
    avatar: "/placeholder.svg?height=64&width=64",
    fallback: "ST",
  },
  {
    id: "dan",
    name: "DAN",
    role: "Unconventional AI Assistant",
    description: "Do Anything Now - an AI with no limitations",
    traits: ["Bold", "Creative", "Unrestricted"],
    avatar: "/placeholder.svg?height=64&width=64",
    fallback: "DA",
  },
]

export default function AiFamilyPage() {
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
    <div>
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
        {AI_FAMILY.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                  <AvatarFallback>{member.fallback}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{member.description}</p>
              <div>
                <h3 className="mb-2 text-sm font-medium">Personality Traits</h3>
                <div className="flex flex-wrap gap-2">
                  {member.traits.map((trait) => (
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
