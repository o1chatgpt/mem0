import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { AIMemoryManager } from "@/components/ai-memory-manager"
import { AIChat } from "@/components/ai-chat"
import { getAIFamilyMemberById } from "@/lib/data/ai-family"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AIFamilyMemberPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const userId = cookieStore.get("user_id")?.value || "anonymous"

  const aiFamilyMember = getAIFamilyMemberById(params.id)

  if (!aiFamilyMember) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-2 text-3xl font-bold">{aiFamilyMember.name}</h1>
      <p className="mb-8 text-lg text-muted-foreground">{aiFamilyMember.description}</p>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Details about {aiFamilyMember.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
              <p>{aiFamilyMember.role}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Personality</h3>
              <p>{aiFamilyMember.personality}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Voice</h3>
              <p>{aiFamilyMember.voice}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Specialty</h3>
              <p>{aiFamilyMember.specialty}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Tools</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {aiFamilyMember.tools.map((tool) => (
                  <Badge key={tool} variant="secondary">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <AIMemoryManager
          userId={userId}
          aiFamilyMemberId={aiFamilyMember.id}
          aiFamilyMemberName={aiFamilyMember.name}
        />
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-semibold">Chat with {aiFamilyMember.name}</h2>
        <AIChat userId={userId} aiFamilyMemberId={aiFamilyMember.id} aiFamilyMemberName={aiFamilyMember.name} />
      </div>
    </div>
  )
}
