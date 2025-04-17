import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function CaseStudiesPage() {
  // Sample case studies data
  const caseStudies = [
    {
      id: "1",
      title: "Enterprise Customer Support",
      description: "How AI family members improved customer support efficiency by 45%",
      industry: "Technology",
      date: "2023-05-15",
    },
    {
      id: "2",
      title: "Healthcare Patient Assistance",
      description: "Using AI family members to provide 24/7 patient support",
      industry: "Healthcare",
      date: "2023-06-22",
    },
    {
      id: "3",
      title: "Educational Tutoring",
      description: "AI family members as personalized tutors for K-12 students",
      industry: "Education",
      date: "2023-07-10",
    },
    {
      id: "4",
      title: "Financial Advisory",
      description: "How AI family members help provide personalized financial advice",
      industry: "Finance",
      date: "2023-08-05",
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Case Studies</h1>
          <p className="text-lg text-muted-foreground">Browse success stories and case studies</p>
        </div>
        <Button>Add Case Study</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {caseStudies.map((caseStudy) => (
          <Card key={caseStudy.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{caseStudy.title}</CardTitle>
                <Badge>{caseStudy.industry}</Badge>
              </div>
              <CardDescription>{caseStudy.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Published: {caseStudy.date}</p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="flex-1">
                View Details
              </Button>
              <Button className="flex-1">Download PDF</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
