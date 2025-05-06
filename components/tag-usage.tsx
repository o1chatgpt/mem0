"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag, FileText, AlertCircle } from "lucide-react"
import { processTagUsage, type TagUsageData } from "@/lib/visualization-utils"
import { mem0Client, Mem0Error } from "@/lib/mem0-client"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function TagUsage() {
  const { files = [], memoryStore } = useAppContext()
  const [tagUsageData, setTagUsageData] = useState<TagUsageData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<TagUsageData | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle client-side only code
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Skip on server-side
    if (!isMounted) return

    const loadTagUsageData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Process tag usage data
        // First try to get tags from Mem0 client
        const getFileTags = async (fileId: string): Promise<string[]> => {
          if (mem0Client.isInitialized()) {
            try {
              // Search for memories related to this file
              const memories = await mem0Client.searchMemory(fileId)
              // Extract tags from metadata
              const tags: string[] = []
              memories.forEach((memory) => {
                if (memory.metadata?.tags && Array.isArray(memory.metadata.tags)) {
                  tags.push(...memory.metadata.tags)
                }
              })
              return [...new Set(tags)] // Remove duplicates
            } catch (err) {
              console.warn(`Could not fetch tags for file ${fileId} from Mem0:`, err)
              // Fall back to memory store
            }
          }

          // Fall back to memory store
          return memoryStore?.getFileTags ? memoryStore.getFileTags(fileId) : []
        }

        const tagData = await processTagUsage(files, getFileTags)
        setTagUsageData(tagData)

        // Select the most used tag by default
        if (tagData.length > 0 && !selectedTag) {
          setSelectedTag(tagData[0])
        }
      } catch (err) {
        console.error("Error loading tag usage data:", err)

        let errorMessage = "Failed to load tag usage data"
        if (err instanceof Mem0Error) {
          errorMessage = err.message
        } else if (err instanceof Error) {
          errorMessage = err.message
        }

        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    loadTagUsageData()
  }, [files, memoryStore, selectedTag, isMounted])

  // Get max count for scaling
  const maxCount = Math.max(...tagUsageData.map((tag) => tag.count), 1)

  // If not mounted yet (server-side), render a minimal version
  if (!isMounted) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-base">
            <Tag className="h-4 w-4 mr-2 text-primary" />
            Tag Usage
          </CardTitle>
          <CardDescription>Most common tags in your memory</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-base">
          <Tag className="h-4 w-4 mr-2 text-primary" />
          Tag Usage
        </CardTitle>
        <CardDescription>Most common tags in your memory</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : tagUsageData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Tag className="h-12 w-12 mb-2 opacity-50" />
            <p>No tag usage data available</p>
            <p className="text-xs mt-1">Start tagging files to see your tag usage</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-md p-3">
              <h3 className="text-sm font-medium mb-3">Tag Distribution</h3>
              <div className="space-y-2">
                {tagUsageData.map((tag) => (
                  <div
                    key={tag.name}
                    className={`cursor-pointer transition-colors ${
                      selectedTag?.name === tag.name ? "opacity-100" : "opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setSelectedTag(tag)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <Tag className="h-3 w-3 mr-1 text-primary" />
                        <span className="text-sm">{tag.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{tag.count} files</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${(tag.count / maxCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedTag && (
              <div className="border rounded-md p-3">
                <h3 className="text-sm font-medium mb-2">Files tagged with "{selectedTag.name}"</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {selectedTag.files.map((file) => (
                    <div key={file.id} className="flex items-center p-1">
                      <FileText className="h-3 w-3 text-gray-500 mr-2" />
                      <span className="text-xs truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
