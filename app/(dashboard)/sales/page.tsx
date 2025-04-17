import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function SalesPage() {
  // Sample sales materials data
  const salesMaterials = [
    {
      id: "1",
      title: "AI Family Overview",
      description: "Complete overview of AI family capabilities and benefits",
      type: "Presentation",
      lastUpdated: "2023-07-15",
    },
    {
      id: "2",
      title: "ROI Calculator",
      description: "Interactive tool to calculate return on investment",
      type: "Tool",
      lastUpdated: "2023-08-22",
    },
    {
      id: "3",
      title: "Feature Comparison",
      description: "Detailed comparison with competitor products",
      type: "Document",
      lastUpdated: "2023-06-10",
    },
    {
      id: "4",
      title: "Customer Testimonials",
      description: "Collection of customer success stories and testimonials",
      type: "Video",
      lastUpdated: "2023-09-05",
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Sales Materials</h1>
          <p className="text-lg text-muted-foreground">Access and manage sales resources</p>
        </div>
        <Button>Add Material</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {salesMaterials.map((material) => (
          <Card key={material.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{material.title}</CardTitle>
                <Badge variant="outline">{material.type}</Badge>
              </div>
              <CardDescription>{material.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Last updated: {material.lastUpdated}</p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Preview
              </Button>
              <Button className="flex-1">Download</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
