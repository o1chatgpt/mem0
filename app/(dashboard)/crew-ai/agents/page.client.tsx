"use client"

import Link from "next/link"
import { useCrewAI } from "@/components/crew-ai-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Database } from "lucide-react"
import { SetupCrewAIButton } from "@/components/setup-crew-ai-button"

export default function AgentsPageClient() {
  const { agents, loading, tablesExist } = useCrewAI()
  const [activeTab, setActiveTab] = useState("grid")

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">Loading agents...</p>
        </div>
      </div>
    )
  }

  // If tables don't exist, show setup screen
  if (!tablesExist) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">AI Agents</h1>
          <p className="text-lg text-muted-foreground">View and manage your AI family members as CrewAI agents</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Setup Required
            </CardTitle>
            <CardDescription>
              The CrewAI database tables need to be set up before you can use this feature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              CrewAI requires database tables to store tasks, assignments, and other information. Click the button below
              to set up the required database tables.
            </p>
            <SetupCrewAIButton />
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            After setup is complete, please refresh the page to start using CrewAI.
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">AI Agents</h1>
        <p className="text-lg text-muted-foreground">View and manage your AI family members as CrewAI agents</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={agent.avatar_url || "/placeholder.svg"} alt={agent.name} />
                      <AvatarFallback>{agent.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{agent.name}</CardTitle>
                      <CardDescription>{agent.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{agent.description || `Specializes in ${agent.specialty}`}</p>
                  <div>
                    <h3 className="mb-2 text-sm font-medium">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {agent.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                      {agent.skills.length > 3 && <Badge variant="outline">+{agent.skills.length - 3} more</Badge>}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/crew-ai/agents/${agent.id}`}>View Profile</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <div className="rounded-md border">
            {agents.map((agent, index) => (
              <div
                key={agent.id}
                className={`flex items-center justify-between p-4 ${index !== agents.length - 1 ? "border-b" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={agent.avatar_url || "/placeholder.svg"} alt={agent.name} />
                    <AvatarFallback>{agent.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge>{agent.specialty}</Badge>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/crew-ai/agents/${agent.id}`}>Profile</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/ai-family/${agent.id}`}>Chat</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
