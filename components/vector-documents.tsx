"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FileText, Search, RefreshCw, FileUp, Trash2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useMem0 } from "@/components/mem0-provider"

// Extended document type with UI-specific properties
interface VectorDocument {
  id: string
  title: string
  path: string
  type: string
  tokens: number
  tags: string[]
  lastUpdated: string
  content?: string
  metadata?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

export function VectorDocuments() {
  const { isInitialized, isLoading: mem0Loading, error: mem0Error, memories, refreshMemories } = useMem0()

  const [documents, setDocuments] = useState<VectorDocument[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle client-side only code
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Convert Mem0 memories to vector documents when memories change
  useEffect(() => {
    if (isInitialized && memories.length > 0) {
      // Convert memories to vector documents
      const docs: VectorDocument[] = memories.map((memory) => ({
        id: memory.id,
        title: memory.content.slice(0, 50) + (memory.content.length > 50 ? "..." : ""),
        path: memory.metadata?.path || `/documents/${memory.id}`,
        type: memory.metadata?.type || "txt",
        tokens: memory.content.split(/\s+/).length * 1.3, // Rough estimate
        tags: memory.metadata?.tags || [],
        lastUpdated: memory.updatedAt,
        // Keep original memory data
        content: memory.content,
        metadata: memory.metadata,
        createdAt: memory.createdAt,
        updatedAt: memory.updatedAt,
      }))

      setDocuments(docs)
      setIsLoading(false)
    } else if (isInitialized) {
      // Mem0 is initialized but no memories
      setDocuments([])
      setIsLoading(false)
    }
  }, [isInitialized, memories])

  // Load mock documents if Mem0 is not initialized
  useEffect(() => {
    if (!isMounted || isInitialized) return

    const loadMockDocuments = () => {
      setIsLoading(true)

      // Fall back to mock data if Mem0 client is not initialized
      setDocuments([
        {
          id: "1",
          title: "Project Proposal - Q2 2023",
          path: "/Documents/Projects/project-proposal-q2-2023.docx",
          type: "docx",
          tokens: 3250,
          tags: ["project", "proposal", "2023"],
          lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
        {
          id: "2",
          title: "Marketing Strategy",
          path: "/Documents/Marketing/strategy-2023.pptx",
          type: "pptx",
          tokens: 2100,
          tags: ["marketing", "strategy"],
          lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        },
        {
          id: "3",
          title: "Financial Report - Q1 2023",
          path: "/Documents/Finance/q1-2023-report.xlsx",
          type: "xlsx",
          tokens: 4500,
          tags: ["finance", "report", "q1", "2023"],
          lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        },
      ])

      setIsLoading(false)
    }

    loadMockDocuments()
  }, [isMounted, isInitialized])

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleRefresh = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (isInitialized) {
        await refreshMemories()
      } else {
        // Just refresh the mock data
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Error refreshing documents:", err)
      setError(err instanceof Error ? err.message : "Failed to refresh documents")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return
    }

    try {
      // This would need to be implemented in the Mem0Provider
      // For now, just remove from local state
      setDocuments(documents.filter((doc) => doc.id !== id))
    } catch (err) {
      console.error("Error deleting document:", err)
      alert(err instanceof Error ? err.message : "Failed to delete document")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getFileIcon = (type: string) => {
    return <FileText className="h-4 w-4" />
  }

  // If not mounted yet (server-side), render a minimal version
  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Vector Documents</CardTitle>
              <CardDescription>Documents stored in your vector database</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Use Mem0 error if available
  const displayError = mem0Error || error
  // Use Mem0 loading state if available
  const displayLoading = isInitialized ? mem0Loading : isLoading

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Vector Documents</CardTitle>
            <CardDescription>Documents stored in your vector database</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={displayLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${displayLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <FileUp className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          {displayError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          {displayLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No documents found</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {filteredDocuments.map((doc, index) => (
                  <div key={doc.id}>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 bg-muted rounded-md p-2">{getFileIcon(doc.type)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">{doc.title}</div>
                        <div className="text-sm text-muted-foreground">{doc.path}</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {doc.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                          <span>{Math.round(doc.tokens).toLocaleString()} tokens</span>
                          <span>Updated: {formatDate(doc.lastUpdated)}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {index < filteredDocuments.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
