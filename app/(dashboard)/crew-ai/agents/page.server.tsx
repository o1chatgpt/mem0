import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// This is a server component that will be used for static rendering
export default function AgentsPageServer() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">AI Agents</h1>
        <p className="text-lg text-muted-foreground">View and manage your AI family members as CrewAI agents</p>
      </div>

      <div className="mb-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* This is just a placeholder for static rendering */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Loading...</CardTitle>
                  <CardDescription>Please wait</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Loading agent information...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
