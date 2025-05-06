"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useMem0 } from "./mem0-provider"

export function MemoryDashboard() {
  const { memories, stats, isLoading, refreshMemories, refreshStats } = useMem0()
  const [activeTab, setActiveTab] = useState("overview")

  const handleRefresh = async () => {
    await Promise.all([refreshMemories(), refreshStats()])
  }

  const isMockData = memories.some((memory) => memory.id.startsWith("mock-"))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Memory Dashboard</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isMockData && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <p className="text-yellow-800">
              <strong>Note:</strong> Using mock data because the Mem0 API endpoints could not be reached. This is
              expected during development or if the API is not properly configured.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalDocuments || 0}</div>
                <p className="text-xs text-muted-foreground">{isLoading ? "Loading..." : "Stored in memory"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalTokens?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">{isLoading ? "Loading..." : "Used for embeddings"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.averageTokensPerDocument?.toFixed(0) || 0}</div>
                <p className="text-xs text-muted-foreground">{isLoading ? "Loading..." : "Per document"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{stats?.memoryHealth || "Unknown"}</div>
                <p className="text-xs text-muted-foreground">{isLoading ? "Loading..." : "Overall status"}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>The most recently added or updated documents in memory.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {isLoading ? (
                    <p>Loading recent documents...</p>
                  ) : memories.length > 0 ? (
                    memories.slice(0, 5).map((memory) => (
                      <div key={memory.id} className="flex items-center p-2 rounded-md hover:bg-muted">
                        <div>
                          <p className="font-medium">{memory.title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-md">
                            {memory.content.substring(0, 100)}
                            {memory.content.length > 100 ? "..." : ""}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No documents found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Tags</CardTitle>
                <CardDescription>Most frequently used tags in your documents.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {isLoading ? (
                    <p>Loading tags...</p>
                  ) : stats?.topTags && stats.topTags.length > 0 ? (
                    stats.topTags.slice(0, 5).map((tag, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="font-medium">{tag.tag}</span>
                        <span className="text-muted-foreground">{tag.count} documents</span>
                      </div>
                    ))
                  ) : (
                    <p>No tags found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>All documents stored in memory.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading documents...</p>
              ) : memories.length > 0 ? (
                <div className="space-y-4">
                  {memories.map((memory) => (
                    <div key={memory.id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold">{memory.title}</h3>
                        <div className="flex space-x-2">
                          {memory.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-muted-foreground">{memory.content}</p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Created: {new Date(memory.created).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No documents found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>Your memory interaction history.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>History view is under development.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Insights</CardTitle>
              <CardDescription>Analytics and insights from your memory data.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Insights view is under development.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Chronological view of your memory data.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Timeline view is under development.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap">
          <Card>
            <CardHeader>
              <CardTitle>Heatmap</CardTitle>
              <CardDescription>Activity heatmap of your memory usage.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Heatmap view is under development.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
