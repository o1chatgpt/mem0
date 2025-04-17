import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AI_FAMILY_MEMBERS } from "@/lib/data/ai-family"

export default function AIFamilyPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-2 text-3xl font-bold">AI Family Members</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        Choose an AI family member to chat with or manage their memories
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {AI_FAMILY_MEMBERS.map((member) => (
          <Card key={member.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle>{member.name}</CardTitle>
              <CardDescription>{member.role}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm">{member.description}</p>
              <div className="mb-2">
                <span className="text-xs font-medium text-muted-foreground">Specialty:</span>
                <p className="text-sm">{member.specialty}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Tools:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {member.tools.slice(0, 3).map((tool) => (
                    <Badge key={tool} variant="outline" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                  {member.tools.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{member.tools.length - 3} more
                    </Badge>
                  )}
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
