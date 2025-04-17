"use client"

import { useState, useEffect, useRef } from "react"
import { useCollaborativeEditing } from "@/hooks/use-collaborative-editing"
import { useConflictResolution } from "@/hooks/use-conflict-resolution"
import type { Conflict } from "@/lib/conflict-resolution-service"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { ConflictResolutionDialog } from "@/components/conflict-resolution-dialog"
import { useToast } from "@/hooks/use-toast"

interface CollaborativeEditorWithConflictResolutionProps {
  documentId: string
  initialContent: string
  userId: string
  userName: string
}

export function CollaborativeEditorWithConflictResolution({
  documentId,
  initialContent,
  userId,
  userName,
}: CollaborativeEditorWithConflictResolutionProps) {
  const [content, setContent] = useState(initialContent)
  const [activeConflict, setActiveConflict] = useState<Conflict | null>(null)
  const lastSyncedContent = useRef(initialContent)
  const { toast } = useToast()

  // Initialize collaborative editing hook
  const { collaborators, sendOperation, operations, isConnected } = useCollaborativeEditing(
    documentId,
    userId,
    userName,
  )

  // Initialize conflict resolution hook
  const { activeConflicts, detectConflict, resolveConflict, isResolving } = useConflictResolution(userId, documentId)

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent)

    // Send the operation to other collaborators
    sendOperation({
      type: "update",
      userId,
      userName,
      documentId,
      content: newContent,
      timestamp: Date.now(),
    })
  }

  // Process incoming operations
  useEffect(() => {
    if (operations.length === 0) return

    const latestOperation = operations[operations.length - 1]

    // Skip our own operations
    if (latestOperation.userId === userId) return

    // Check for conflicts
    const checkForConflict = async () => {
      if (content !== lastSyncedContent.current) {
        // There's a potential conflict
        const conflict = await detectConflict(
          "document",
          userId,
          userName,
          content,
          latestOperation.userId,
          latestOperation.userName,
          latestOperation.content,
        )

        if (conflict) {
          setActiveConflict(conflict)
          // Don't update content yet, wait for conflict resolution
          return
        }
      }

      // No conflict, update content
      setContent(latestOperation.content)
      lastSyncedContent.current = latestOperation.content
    }

    checkForConflict()
  }, [operations, userId, userName, content, detectConflict])

  // Handle conflict resolution
  const handleResolveConflict = async (
    resolution: "user-a" | "user-b" | "merge" | "custom",
    customContent?: string,
  ) => {
    if (!activeConflict) return

    try {
      const resolvedConflict = await resolveConflict(activeConflict.id, resolution, customContent)

      if (resolvedConflict && resolvedConflict.resolution) {
        // Update content with resolved version
        setContent(resolvedConflict.resolution.chosenContent)
        lastSyncedContent.current = resolvedConflict.resolution.chosenContent

        // Send the resolved content to other collaborators
        sendOperation({
          type: "conflict-resolution",
          userId,
          userName,
          documentId,
          content: resolvedConflict.resolution.chosenContent,
          timestamp: Date.now(),
          metadata: {
            conflictId: resolvedConflict.id,
            resolution,
          },
        })

        toast({
          title: "Conflict resolved",
          description: "Your changes have been successfully merged.",
        })
      }
    } catch (error) {
      console.error("Error resolving conflict:", error)
      toast({
        title: "Error",
        description: "Failed to resolve the conflict. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActiveConflict(null)
    }
  }

  // Cancel conflict resolution
  const handleCancelConflict = () => {
    setActiveConflict(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? "default" : "destructive"}>{isConnected ? "Connected" : "Disconnected"}</Badge>
          <span className="text-sm text-muted-foreground">
            {collaborators.length} {collaborators.length === 1 ? "person" : "people"} editing
          </span>
        </div>

        <div className="flex -space-x-2">
          {collaborators.map((collaborator) => (
            <Avatar key={collaborator.id} className="border-2 border-background h-8 w-8">
              <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-xs">
                {collaborator.name.charAt(0)}
              </div>
            </Avatar>
          ))}
        </div>
      </div>

      <Textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        className="min-h-[300px] font-mono"
        placeholder="Start typing..."
      />

      {activeConflict && (
        <ConflictResolutionDialog
          conflict={activeConflict}
          currentUserId={userId}
          onResolve={handleResolveConflict}
          onCancel={handleCancelConflict}
        />
      )}
    </div>
  )
}
