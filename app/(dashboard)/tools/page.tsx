import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Sample tools data
const TOOLS = [
  {
    id: "1",
    name: "Web Search",
    description: "Search the web for information",
    category: "Information",
    aiMembers: ["lyra", "sophia", "dan"],
  },
  {
    id: "2",
    name: "Calendar Manager",
    description: "Manage calendar events and appointments",
    category: "Productivity",
    aiMembers: ["kara"],
  },
  {
    id: "3",
    name: "Code Generator",
    description: "Generate code snippets in various languages",
    category: "Development",
    aiMembers: ["sophia", "stan", "dan"],
  },
  {
    id: "4",
    name: "Security Scanner",
    description: "Scan for security vulnerabilities",
    category: "Security",
    aiMembers: ["cecilia"],
  },
  {
    id: "5",
    name: "Image Generator",
    description: "Generate images from text descriptions",
    category: "Creative",
    aiMembers: ["lyra", "stan"],
  },
  {
    id: "6",
    name: "Data Analyzer",
    description: "Analyze data and generate insights",
    category: "Analytics",
    aiMembers: ["karl", "dan"],
  },
]

const AI_FAMILY_MEMBERS = [
  { id: "lyra", name: "Lyra" },
  { id: "sophia", name: "Sophia" },
  { id: "dan", name: "Dan" },
  { id: "kara", name: "Kara" },
  { id: "stan", name: "Stan" },
  { id: "cecilia", name: "Cecilia" },
  { id: "karl", name: "Karl" },
]

export default function ToolsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Tools</h1>
          <p className="text-lg text-muted-foreground">Manage tools for your AI family members</p>
        </div>
        <Button asChild>
          <Link href="/tools/create">Create Tool</Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Card key={tool.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>{tool.name}</CardTitle>
                <Badge>{tool.category}</Badge>
              </div>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Used by</h3>
                <div className="flex flex-wrap gap-1">
                  {tool.aiMembers.map((memberId) => {
                    const member = AI_FAMILY_MEMBERS.find((m) => m.id === memberId)
                    return member ? (
                      <Badge key={memberId} variant="outline">
                        {member.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/tools/${tool.id}`}>View</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href={`/tools/${tool.id}/edit`}>Edit</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
