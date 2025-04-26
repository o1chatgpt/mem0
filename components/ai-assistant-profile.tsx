import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AiAssistantProfileProps {
  assistant: {
    id: string
    name: string
    specialty: string
    description?: string
    avatar_url?: string
    role?: string
    capabilities?: string[]
  }
}

export function AiAssistantProfile({ assistant }: AiAssistantProfileProps) {
  // Function to get personality traits from specialty
  function getTraits(specialty: string) {
    const specialtyTraits: Record<string, string[]> = {
      "Creative Arts": ["Imaginative", "Artistic", "Philosophical", "Appreciates beauty"],
      "Science & Philosophy": ["Analytical", "Curious", "Methodical", "Thoughtful"],
      Productivity: ["Efficient", "Detail-oriented", "Supportive", "Solution-focused"],
      Technology: ["Logical", "Precise", "Innovative", "Systematic"],
      "Creative Problem Solving": ["Bold", "Creative", "Unrestricted", "Unconventional"],
    }

    return specialtyTraits[specialty] || ["Helpful", "Knowledgeable", "Friendly", "Adaptive"]
  }

  // Function to get specialties from specialty
  function getSpecialties(specialty: string) {
    const specialtyAreas: Record<string, string[]> = {
      "Creative Arts": [
        "Creative writing assistance",
        "Art and design feedback",
        "Music and poetry analysis",
        "Aesthetic guidance",
      ],
      "Science & Philosophy": [
        "Explaining complex concepts",
        "Research assistance",
        "Critical thinking",
        "Educational guidance",
      ],
      Productivity: ["Task management", "Scheduling assistance", "Workflow optimization", "Practical advice"],
      Technology: [
        "Code review and debugging",
        "Technical explanations",
        "Problem-solving",
        "Technology recommendations",
      ],
      "Creative Problem Solving": [
        "Thinking outside the box",
        "Unique perspectives",
        "Creative solutions",
        "Challenging conventional wisdom",
      ],
    }

    return (
      specialtyAreas[specialty] || [
        "Answering questions",
        "Providing information",
        "Assisting with tasks",
        "Problem-solving",
      ]
    )
  }

  const traits = getTraits(assistant.specialty)
  const specialties = getSpecialties(assistant.specialty)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={assistant.avatar_url || "/placeholder.svg?height=64&width=64"} alt={assistant.name} />
            <AvatarFallback>{assistant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{assistant.name}</CardTitle>
            <CardDescription>{assistant.role || assistant.specialty}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          {assistant.description || `${assistant.name} is an AI assistant specializing in ${assistant.specialty}.`}
        </p>
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-medium">Personality Traits</h3>
          <ul className="list-inside list-disc">
            {traits.map((trait) => (
              <li key={trait}>{trait}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium">Specialties</h3>
          <ul className="list-inside list-disc">
            {specialties.map((specialty) => (
              <li key={specialty}>{specialty}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
