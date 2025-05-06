"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileIcon, Link2, Clock, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface FileAssociation {
  fileId: string
  fileName: string
  filePath: string
  strength: number // 0-1
  reason: string
  lastAccessed?: string
}

export function FileAssociations() {
  const { selectedFileId, memoryStore, selectFile, navigateToFolder } = useAppContext()
  const [associations, setAssociations] = useState<FileAssociation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAssociations() {
      if (!selectedFileId) {
        setAssociations([])
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Get file associations from mem0
        const fileAssociations = (await memoryStore.recall(`file_associations:${selectedFileId}`)) || []

        // If we have associations stored, use them
        if (fileAssociations.length > 0) {
          setAssociations(fileAssociations)
          setLoading(false)
          return
        }

        // Otherwise, generate associations based on access patterns and content similarity
        const accessPatterns = await memoryStore.getFileAccessPatterns()
        const selectedFilePattern = accessPatterns[selectedFileId]

        if (!selectedFilePattern) {
          setAssociations([])
          setLoading(false)
          return
        }

        // Find files that are accessed in similar patterns
        const associatedFiles: FileAssociation[] = []

        for (const [fileId, pattern] of Object.entries(accessPatterns)) {
          if (fileId === selectedFileId) continue

          // Calculate similarity score based on access patterns
          let similarityScore = 0

          // Time of day similarity
          const timeKeys = new Set([
            ...Object.keys(selectedFilePattern.timeOfDayPattern),
            ...Object.keys(pattern.timeOfDayPattern),
          ])

          let timeSimCount = 0
          timeKeys.forEach((hour) => {
            const selectedCount = selectedFilePattern.timeOfDayPattern[hour] || 0
            const patternCount = pattern.timeOfDayPattern[hour] || 0

            if (selectedCount > 0 && patternCount > 0) {
              timeSimCount++
            }
          })

          similarityScore += (timeSimCount / timeKeys.size) * 0.3

          // Day of week similarity
          const dayKeys = new Set([
            ...Object.keys(selectedFilePattern.dayOfWeekPattern),
            ...Object.keys(pattern.dayOfWeekPattern),
          ])

          let daySimCount = 0
          dayKeys.forEach((day) => {
            const selectedCount = selectedFilePattern.dayOfWeekPattern[day] || 0
            const patternCount = pattern.dayOfWeekPattern[day] || 0

            if (selectedCount > 0 && patternCount > 0) {
              daySimCount++
            }
          })

          similarityScore += (daySimCount / dayKeys.size) * 0.3

          // Sequential access (files often accessed together)
          // This would require more complex analysis of the activity timeline
          // For now, we'll use a placeholder value
          similarityScore += 0.4

          if (similarityScore > 0.3) {
            associatedFiles.push({
              fileId,
              fileName: pattern.fileName || fileId,
              filePath: pattern.filePath || "/unknown",
              strength: similarityScore,
              reason: "Frequently accessed together",
              lastAccessed: pattern.lastAccessed,
            })
          }
        }

        // Sort by strength
        associatedFiles.sort((a, b) => b.strength - a.strength)

        // Store the associations for future use
        await memoryStore.remember(`file_associations:${selectedFileId}`, associatedFiles)

        setAssociations(associatedFiles)
      } catch (err) {
        console.error("Error loading file associations:", err)
        setError("Failed to load file associations")
      } finally {
        setLoading(false)
      }
    }

    loadAssociations()
  }, [selectedFileId, memoryStore])

  const handleSelectFile = async (association: FileAssociation) => {
    try {
      // Extract folder path
      const folderPath = association.filePath.split("/").slice(0, -1).join("/")

      // Navigate to the folder containing the file
      await navigateToFolder(folderPath)

      // Select the file
      await selectFile(association.fileId)

      // Record this association access
      await memoryStore.recordFileAccess(association.fileId, "association_click", {
        sourceFileId: selectedFileId,
      })
    } catch (err) {
      console.error("Error selecting associated file:", err)
    }
  }

  if (!selectedFileId) {
    return null
  }

  if (loading) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Link2 className="h-4 w-4 mr-2 text-primary" />
            Related Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-8 w-8 rounded mr-2" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Link2 className="h-4 w-4 mr-2 text-primary" />
            Related Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (associations.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Link2 className="h-4 w-4 mr-2 text-primary" />
            Related Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No related files found. As you work with more files, we'll identify relationships between them.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Link2 className="h-4 w-4 mr-2 text-primary" />
          Related Files
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {associations.slice(0, 5).map((association) => (
            <div
              key={association.fileId}
              className="flex items-start p-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
              onClick={() => handleSelectFile(association)}
            >
              <div className="mr-3 mt-0.5">
                <FileIcon className="h-5 w-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{association.fileName}</p>
                <p className="text-xs text-muted-foreground truncate">{association.filePath}</p>
                <div className="flex items-center mt-1">
                  <Badge variant="outline" className="text-xs mr-2">
                    {Math.round(association.strength * 100)}% related
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center">
                    {association.reason === "Frequently accessed together" ? (
                      <>
                        <Users className="h-3 w-3 mr-1" />
                        Used together
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        {association.reason}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
