import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentMemories } from "@/components/recent-memories"
import { MemoryUsage } from "@/components/memory-usage"
import { Database, FileText, FolderOpen, Users } from "lucide-react"
import Link from "next/link"

export default function Home() {
  // In a real app, this would come from authentication
  const userId = 1 // Using the admin user we created in the database

  // Check if Supabase environment variables are available
  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!isSupabaseConfigured) {
    return (
      <div className="container mx-auto py-10">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Configuration Error</CardTitle>
            <CardDescription>Missing Supabase Environment Variables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                The application requires Supabase environment variables to be set. Please add the following environment
                variables to your project:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> - Your Supabase project
                  URL
                </li>
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Your Supabase
                  anonymous key
                </li>
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded">SUPABASE_URL</code> - Same as NEXT_PUBLIC_SUPABASE_URL
                  (for server-side)
                </li>
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> - Your Supabase
                  service role key (for server-side)
                </li>
              </ul>
              <p>
                After adding these environment variables, restart the application to connect to your Supabase project.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <DashboardStats />
      </div>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
          <TabsTrigger value="ai-family">AI Family</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <RecentMemories userId={userId} />
            <MemoryUsage userId={userId} />
          </div>
        </TabsContent>
        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>Files</CardTitle>
              <CardDescription>Manage your files and documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Manage Your Files</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Upload, organize, and access your files from anywhere.
                </p>
                <Link href="/files">
                  <Button>Go to Files</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="folders">
          <Card>
            <CardHeader>
              <CardTitle>Folders</CardTitle>
              <CardDescription>Organize your content in folders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Manage Your Folders</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create folders to organize your files and content.
                </p>
                <Link href="/folders">
                  <Button>Go to Folders</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ai-family">
          <Card>
            <CardHeader>
              <CardTitle>AI Family</CardTitle>
              <CardDescription>Manage your AI family members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Manage Your AI Family</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create and customize AI family members to help with your tasks.
                </p>
                <Link href="/ai-family">
                  <Button>Go to AI Family</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Memory Analytics</CardTitle>
            <CardDescription>Analyze your memory usage and patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <Database className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-center mb-4">
                View detailed analytics about your memory usage and patterns.
              </p>
              <Link href="/memory-analytics">
                <Button variant="outline">View Analytics</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mem0 Integration</CardTitle>
            <CardDescription>Configure your Mem0 integration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <Brain className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-center mb-4">
                Configure and manage your Mem0 integration settings.
              </p>
              <Link href="/mem0-integration">
                <Button variant="outline">Configure Mem0</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Hub</CardTitle>
            <CardDescription>Manage API keys and integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <Key className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-center mb-4">
                Manage your API keys and external service integrations.
              </p>
              <Link href="/api-hub">
                <Button variant="outline">Open API Hub</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Import the Brain and Key icons
function Brain(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5" />
      <path d="M12 15v-2" />
      <path d="M12 9v0" />
    </svg>
  )
}

function Key(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  )
}
