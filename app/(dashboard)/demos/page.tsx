import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function DemosPage() {
  // Sample demos data
  const demos = [
    {
      id: "1",
      title: "AI Family Chat",
      description: "Demonstrate conversational capabilities of AI family members",
      status: "Ready",
      aiMembers: ["kara", "lyra", "sophia"],
    },
    {
      id: "2",
      title: "Memory Retention Demo",
      description: "Show how AI family members remember user preferences and facts",
      status: "Ready",
      aiMembers: ["kara", "stan", "karl"],
    },
    {
      id: "3",
      title: "Voice Synthesis",
      description: "Demonstrate voice capabilities across different AI family members",
      status: "In Progress",
      aiMembers: ["lyra", "sophia", "dude"],
    },
    {
      id: "4",
      title: "Tool Integration",
      description: "Show how AI family members use different tools",
      status: "Ready",
      aiMembers: ["sophia", "stan", "karl"],
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Demos</h1>
          <p className="text-lg text-muted-foreground">Manage and run demos</p>
        </div>
        <Button>Create Demo</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {demos.map((demo) => (
          <Card key={demo.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{demo.title}</CardTitle>
                <Badge variant={demo.status === "Ready" ? "default" : "outline"}>{demo.status}</Badge>
              </div>
              <CardDescription>{demo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <h3 className="mb-2 text-sm font-medium">AI Family Members</h3>
                <div className="flex flex-wrap gap-1">
                  {demo.aiMembers.map((member) => (
                    <Badge key={member} variant="secondary">
                      {member.charAt(0).toUpperCase() + member.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Edit
              </Button>
              <Button className="flex-1" disabled={demo.status !== "Ready"}>
                Run Demo
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
