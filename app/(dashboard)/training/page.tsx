import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function TrainingPage() {
  // Sample training materials data
  const trainingMaterials = [
    {
      id: "1",
      title: "Getting Started with AI Family",
      description: "Learn the basics of working with AI family members",
      duration: "45 minutes",
      progress: 100,
      completed: true,
    },
    {
      id: "2",
      title: "Advanced Memory Management",
      description: "Deep dive into memory features and capabilities",
      duration: "1 hour 15 minutes",
      progress: 60,
      completed: false,
    },
    {
      id: "3",
      title: "Voice Configuration",
      description: "Configure and customize voice settings",
      duration: "30 minutes",
      progress: 0,
      completed: false,
    },
    {
      id: "4",
      title: "Creating Custom Tools",
      description: "Learn how to create and integrate custom tools",
      duration: "1 hour",
      progress: 25,
      completed: false,
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Training</h1>
          <p className="text-lg text-muted-foreground">Access training materials and courses</p>
        </div>
        <Button>Browse All Courses</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {trainingMaterials.map((material) => (
          <Card key={material.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{material.title}</CardTitle>
                <Badge variant={material.completed ? "default" : "outline"}>
                  {material.completed ? "Completed" : "In Progress"}
                </Badge>
              </div>
              <CardDescription>{material.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Duration: {material.duration}</span>
                <span>{material.progress}% complete</span>
              </div>
              <Progress value={material.progress} className="h-2" />
            </CardContent>
            <CardFooter>
              <Button className="w-full">{material.completed ? "Review" : "Continue"}</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
