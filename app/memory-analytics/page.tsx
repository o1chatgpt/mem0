import { Suspense } from "react"
import { MemoryAnalytics } from "@/components/memory-analytics"
import { MemoryGrowthPrediction } from "@/components/memory-growth-prediction"
import { ExportSchedulesManager } from "@/components/export-schedules-manager"
import { MemoryInsights } from "@/components/memory-insights"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiKeyWarning } from "@/components/api-key-warning"
import { hasValidOpenAIKey } from "@/lib/api-key-utils"

export default async function MemoryAnalyticsPage() {
  // Check if OpenAI API key is valid
  const hasValidKey = await hasValidOpenAIKey()

  // Mock user ID for demo purposes
  const userId = 1

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Memory Analytics</h1>
        <p className="text-muted-foreground">Analyze and visualize your application's memory usage and patterns</p>
      </div>

      {!hasValidKey && <ApiKeyWarning />}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Growth Predictions</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="exports">Scheduled Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<AnalyticsSkeleton />}>
            <MemoryAnalytics userId={userId} />
          </Suspense>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Related Features</CardTitle>
                <CardDescription>Other features that work with memory analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <a href="/memory-categories" className="text-blue-500 hover:underline">
                      Memory Categories
                    </a>
                    {" - "}
                    <span className="text-sm text-muted-foreground">Manage and organize your memory categories</span>
                  </li>
                  <li>
                    <a href="/memories" className="text-blue-500 hover:underline">
                      Memory Browser
                    </a>
                    {" - "}
                    <span className="text-sm text-muted-foreground">Browse and search through all stored memories</span>
                  </li>
                  <li>
                    <a href="/ai-family" className="text-blue-500 hover:underline">
                      AI Family Members
                    </a>
                    {" - "}
                    <span className="text-sm text-muted-foreground">View memory usage by AI family member</span>
                  </li>
                  <li>
                    <a href="/api-keys" className="text-blue-500 hover:underline">
                      API Keys
                    </a>
                    {" - "}
                    <span className="text-sm text-muted-foreground">Manage OpenAI and other API keys</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent File Operations</CardTitle>
                <CardDescription>Recent file operations with memory records</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
                  <RecentFileOperations userId={userId} />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions">
          <Suspense fallback={<AnalyticsSkeleton />}>
            <MemoryGrowthPrediction userId={userId} hasValidKey={hasValidKey} />
          </Suspense>
        </TabsContent>

        <TabsContent value="insights">
          <Suspense fallback={<AnalyticsSkeleton />}>
            <MemoryInsights userId={userId} hasValidKey={hasValidKey} />
          </Suspense>
        </TabsContent>

        <TabsContent value="exports">
          <Suspense fallback={<AnalyticsSkeleton />}>
            <ExportSchedulesManager userId={userId} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-[250px]" />
      <Skeleton className="h-[300px] w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-[100px]" />
        <Skeleton className="h-[100px]" />
        <Skeleton className="h-[100px]" />
      </div>
    </div>
  )
}

function RecentFileOperations({ userId }: { userId: number }) {
  return (
    <div className="space-y-3">
      <div className="p-2 bg-muted rounded-md">
        <div className="font-medium">File uploaded: quarterly_report.pdf</div>
        <div className="text-sm text-muted-foreground">Today at 2:30 PM</div>
      </div>
      <div className="p-2 bg-muted rounded-md">
        <div className="font-medium">Folder created: Project Assets</div>
        <div className="text-sm text-muted-foreground">Yesterday at 10:15 AM</div>
      </div>
      <div className="p-2 bg-muted rounded-md">
        <div className="font-medium">File renamed: presentation_final.pptx</div>
        <div className="text-sm text-muted-foreground">2 days ago</div>
      </div>
      <div className="text-center mt-2">
        <a href="/files" className="text-sm text-blue-500 hover:underline">
          View all file operations →
        </a>
      </div>
    </div>
  )
}
