"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, PenToolIcon as Tool, Database, Code, Briefcase, AlertTriangle } from "lucide-react"
import { SetupCrewAIButton } from "@/components/setup-crew-ai-button"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const dashboardItems = [
  {
    title: "AI Family",
    description: "Manage and chat with your AI family members",
    icon: Users,
    href: "/ai-family",
    color: "bg-blue-100 dark:bg-blue-900",
  },
  {
    title: "Tools",
    description: "Configure and use tools for your AI assistants",
    icon: Tool,
    href: "/tools",
    color: "bg-purple-100 dark:bg-purple-900",
  },
  {
    title: "Files",
    description: "Manage your files and documents",
    icon: FileText,
    href: "/files",
    color: "bg-green-100 dark:bg-green-900",
  },
  {
    title: "Database",
    description: "View and manage your database",
    icon: Database,
    href: "/database",
    color: "bg-amber-100 dark:bg-amber-900",
  },
  {
    title: "Code Editor",
    description: "Write and edit code",
    icon: Code,
    href: "/code-editor",
    color: "bg-red-100 dark:bg-red-900",
  },
  {
    title: "CrewAI",
    description: "Manage AI agents and tasks",
    icon: Briefcase,
    href: "/crew-ai",
    color: "bg-teal-100 dark:bg-teal-900",
  },
]

export default function DashboardPage() {
  const [crewAITablesExist, setCrewAITablesExist] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const supabase = createClientComponentClient()

  // Check if CrewAI tables exist
  useEffect(() => {
    async function checkCrewAITables() {
      setIsChecking(true)
      try {
        // Try to query the ai_tasks table
        const { error } = await supabase.from("ai_tasks").select("*", { head: true }).limit(1)

        // If there's an error about the relation not existing, tables don't exist
        if (
          error &&
          (error.message.includes('relation "ai_tasks" does not exist') ||
            error.message.includes('relation "public.ai_tasks" does not exist'))
        ) {
          console.log("Dashboard: ai_tasks table does not exist")
          setCrewAITablesExist(false)
        } else {
          console.log("Dashboard: ai_tasks table exists or different error")
          setCrewAITablesExist(true)
        }
      } catch (error) {
        console.error("Error checking CrewAI tables:", error)
        setCrewAITablesExist(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkCrewAITables()
  }, [supabase])

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
      <p className="mb-8 text-lg text-muted-foreground">Welcome to your File Manager dashboard</p>

      {crewAITablesExist === false && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              CrewAI Setup Required
            </CardTitle>
            <CardDescription>
              The CrewAI feature requires database tables to be set up before it can be used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertTitle>Database tables not found</AlertTitle>
              <AlertDescription>
                The required database tables for CrewAI functionality are missing. This is normal if this is your first
                time using the application.
              </AlertDescription>
            </Alert>
            <p className="mb-4">
              Click the button below to set up the required database tables for the CrewAI feature.
            </p>
            <SetupCrewAIButton />
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            After setup is complete, the page will refresh automatically to start using CrewAI.
          </CardFooter>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardItems.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-2 ${item.color}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <CardTitle>{item.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{item.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={item.href}>Go to {item.title}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold">Recent Activity</h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">Chat with Lyra</p>
                  <p className="text-sm text-muted-foreground">AI Family</p>
                </div>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">Updated Web Search Tool</p>
                  <p className="text-sm text-muted-foreground">Tools</p>
                </div>
                <p className="text-sm text-muted-foreground">Yesterday</p>
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">Uploaded project.pdf</p>
                  <p className="text-sm text-muted-foreground">Files</p>
                </div>
                <p className="text-sm text-muted-foreground">3 days ago</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Created new database table</p>
                  <p className="text-sm text-muted-foreground">Database</p>
                </div>
                <p className="text-sm text-muted-foreground">1 week ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
