"use client"
import { DashboardStats } from "@/components/dashboard-stats"
import { FileExplorer } from "@/components/file-explorer"
import { RecentMemories } from "@/components/recent-memories"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, FolderOpen, BrainCircuit, Workflow } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  // In a real app, this would come from authentication
  const userId = 1 // Using the admin user we created in the database

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">File Manager Dashboard</h1>
        <div className="flex space-x-2">
          <Link href="/ai-family">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              AI Family
            </Button>
          </Link>
          <Link href="/mem0-integration">
            <Button variant="outline">
              <BrainCircuit className="mr-2 h-4 w-4" />
              Mem0 Integration
            </Button>
          </Link>
          <Link href="/crewai">
            <Button variant="outline">
              <Workflow className="mr-2 h-4 w-4" />
              CrewAI Workflows
            </Button>
          </Link>
        </div>
      </div>

      <DashboardStats userId={userId} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="files">
            <TabsList>
              <TabsTrigger value="files">
                <FolderOpen className="mr-2 h-4 w-4" />
                Files & Folders
              </TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
            </TabsList>
            <TabsContent value="files" className="mt-4">
              <div className="h-[500px]">
                <FileExplorer userId={userId} />
              </div>
            </TabsContent>
            <TabsContent value="recent" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Files</CardTitle>
                  <CardDescription>Files you've recently accessed</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="shared" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Shared Files</CardTitle>
                  <CardDescription>Files shared with you</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <RecentMemories userId={userId} />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">AI Family</CardTitle>
              <CardDescription>Your AI assistants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/ai-family/1/chat">
                  <Button variant="outline" className="w-full justify-start">
                    <div className="flex items-center">
                      <div className="bg-blue-100 text-blue-800 p-2 rounded-full mr-3">A</div>
                      <div className="text-left">
                        <div className="font-medium">Archie</div>
                        <div className="text-xs text-muted-foreground">File Organizer</div>
                      </div>
                    </div>
                  </Button>
                </Link>
                <Link href="/ai-family/2/chat">
                  <Button variant="outline" className="w-full justify-start">
                    <div className="flex items-center">
                      <div className="bg-purple-100 text-purple-800 p-2 rounded-full mr-3">P</div>
                      <div className="text-left">
                        <div className="font-medium">Pixel</div>
                        <div className="text-xs text-muted-foreground">Media Assistant</div>
                      </div>
                    </div>
                  </Button>
                </Link>
                <Link href="/ai-family/4/chat">
                  <Button variant="outline" className="w-full justify-start">
                    <div className="flex items-center">
                      <div className="bg-green-100 text-green-800 p-2 rounded-full mr-3">M</div>
                      <div className="text-left">
                        <div className="font-medium">Memo</div>
                        <div className="text-xs text-muted-foreground">Memory Keeper</div>
                      </div>
                    </div>
                  </Button>
                </Link>
                <Link href="/ai-family">
                  <Button variant="ghost" className="w-full mt-2">
                    View all AI Family Members
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
