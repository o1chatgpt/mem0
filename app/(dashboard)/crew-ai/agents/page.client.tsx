"use client"
import { useCrewAI } from "@/components/crew-ai-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { NetworkErrorAlert } from "@/components/network-error-alert"

export default function AgentsPageClient() {
  const { agents, loading, error, networkError, retryFetch } = useCrewAI()

  if (networkError) {
    return <NetworkErrorAlert onRetry={retryFetch} />
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">AI Agents</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <CardTitle>{agent.name}</CardTitle>
              <CardDescription>{agent.role}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium mb-2">Specialty: {agent.specialty}</p>
              <div className="space-y-1">
                <p className="text-sm font-medium">Skills:</p>
                <ul className="text-sm text-gray-500 list-disc pl-5">
                  {agent.skills.slice(0, 3).map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                  {agent.skills.length > 3 && <li>+ {agent.skills.length - 3} more</li>}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                View Agent
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
