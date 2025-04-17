import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PresentationsPage() {
  // Sample presentations data
  const presentations = [
    {
      id: "1",
      title: "Introduction to AI Family",
      description: "An overview of the AI Family and its capabilities",
      date: "2023-06-15",
      slides: 24,
    },
    {
      id: "2",
      title: "Memory Management in AI Systems",
      description: "How memory works in AI systems and its importance",
      date: "2023-07-22",
      slides: 18,
    },
    {
      id: "3",
      title: "Voice Services Integration",
      description: "Integrating voice services with AI family members",
      date: "2023-08-10",
      slides: 15,
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Presentations</h1>
          <p className="text-lg text-muted-foreground">Manage your presentations</p>
        </div>
        <Button>Create Presentation</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {presentations.map((presentation) => (
          <Card key={presentation.id}>
            <CardHeader>
              <CardTitle>{presentation.title}</CardTitle>
              <CardDescription>{presentation.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Date: {presentation.date}</span>
                <span>{presentation.slides} slides</span>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="flex-1">
                View
              </Button>
              <Button className="flex-1">Edit</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
