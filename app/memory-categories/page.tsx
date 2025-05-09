"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Settings, BarChart2, Brain } from "lucide-react"
import Link from "next/link"
import { MemoryCategoryManager } from "@/components/memory-category-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function MemoryCategoriesPage() {
  // In a real app, this would come from authentication
  const userId = 1 // Using the admin user we created in the database

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Memory Categories</h1>
          <p className="text-muted-foreground">
            Create, edit, and organize categories to better classify your memories
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Memory Categories Management
            </CardTitle>
            <CardDescription>Categories help you organize memories and make them easier to find later.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="manage">
              <TabsList className="mb-4">
                <TabsTrigger value="manage">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Categories
                </TabsTrigger>
                <TabsTrigger value="stats">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Usage Statistics
                </TabsTrigger>
              </TabsList>
              <TabsContent value="manage">
                <MemoryCategoryManager userId={userId} />
              </TabsContent>
              <TabsContent value="stats">
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">Category Usage Statistics</h3>
                  <p className="text-muted-foreground">
                    Detailed statistics about how your categories are being used will appear here.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                About Memory Categories
              </CardTitle>
              <CardDescription>How categories enhance your memory system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Memory categories help organize and contextualize information stored in your AI's memory system. By
                categorizing memories, you can:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Improve memory retrieval accuracy</li>
                <li>Filter memories by topic or context</li>
                <li>Prioritize certain types of information</li>
                <li>Create a more organized knowledge base</li>
              </ul>
              <div className="bg-muted p-3 rounded-md mt-4">
                <h3 className="font-medium mb-2">Tips for effective categorization</h3>
                <ul className="text-sm space-y-1">
                  <li>• Create specific categories for frequent topics</li>
                  <li>• Use consistent naming conventions</li>
                  <li>• Assign colors that make sense to you</li>
                  <li>• Regularly review and update your categories</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Memory System Navigation</CardTitle>
              <CardDescription>Quick access to memory features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1">
                <Link href="/memories">
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="mr-2 h-4 w-4" />
                    Browse All Memories
                  </Button>
                </Link>
                <Link href="/mem0-integration">
                  <Button variant="outline" className="w-full justify-start">
                    <Brain className="mr-2 h-4 w-4" />
                    Mem0 Integration Settings
                  </Button>
                </Link>
                <Link href="/memory-analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Memory Analytics
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full justify-start">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Back to Dashboard
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

// Add the Database icon
function Database(props: React.SVGProps<SVGSVGElement>) {
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
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  )
}

function LayoutDashboard(props: React.SVGProps<SVGSVGElement>) {
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
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  )
}
