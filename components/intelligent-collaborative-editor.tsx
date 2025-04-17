"use client"

import { useState, useRef } from "react"
import { useIntelligentConflictResolution } from "@/hooks/use-intelligent-conflict-resolution"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { IntelligentConflictDialog } from "@/components/intelligent-conflict-dialog"
import { ConflictPredictionAlert } from "@/components/conflict-prediction-alert"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Users } from "lucide-react"

interface IntelligentCollaborativeEditorProps {
  documentId: string
  documentType: string
  initialContent: string
  userId: string
  userName: string
  collaborators: { id: string; name: string }[]
  onSave: (content: string) => void
}

export function IntelligentCollaborativeEditor({
  documentId,
  documentType,
  initialContent,
  userId,
  userName,
  collaborators,
  onSave,
}: IntelligentCollaborativeEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [lastSavedContent, setLastSavedContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [section, setSection] = useState("main")
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Initialize intelligent conflict resolution
  const {
    activeConflicts,
    currentConflict,
    suggestions,
    prediction,
    isResolving,
    detectConflict,
    resolveConflict,
    predictConflicts,
    setConflict,
    setPrediction,
  } = useIntelligentConflictResolution(documentId, documentType)

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent)
  }

  // Save content
  const handleSave = async () => {
    if (content === lastSavedContent) return

    setIsSaving(true)

    try {
      // Check for conflicts before saving
      const userEdits = [
        {
          userId,
          userName,
          content,
          timestamp: Date.now(),
        },
      ]

      // Add simulated edits from collaborators for demo purposes
      // In a real app, you'd get these from your collaborative editing system
      if (collaborators.length > 0 && Math.random() > 0.7) {
        const randomCollaborator = collaborators[Math.floor(Math.random() * collaborators.length)]

        // Create a slightly modified version of the content
        const modifiedContent = content.split(" ")
        if (modifiedContent.length > 5) {
          const randomIndex = Math.floor(Math.random() * (modifiedContent.length - 3)) + 1
          modifiedContent[randomIndex] = "modified_" + modifiedContent[randomIndex]

          userEdits.push({
            userId: randomCollaborator.id,
            userName: randomCollaborator.name,
            content: modifiedContent.join(" "),
            timestamp: Date.now() - 5000, // 5 seconds ago
          })
        }
      }

      // Only check for conflicts if there are multiple edits
      if (userEdits.length > 1) {
        const conflict = await detectConflict(section, { start: 0, end: content.length }, userEdits, {
          before: "",
          after: "",
        })

        if (conflict) {
          // Show conflict dialog
          setConflict(conflict.id)
          toast({
            title: "Editing Conflict Detected",
            description: "Multiple users have made changes to this document.",
            variant: "destructive",
          })
          return
        }
      }

      // No conflict, proceed with save
      await onSave(content)
      setLastSavedContent(content)

      toast({
        title: "Changes Saved",
        description: "Your changes have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving content:", error)
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Predict conflicts when cursor position changes
  const handleCursorPositionChange = async () => {
    if (!contentRef.current) return

    const cursorPosition = contentRef.current.selectionStart
    const cursorSection = `main-${Math.floor(cursorPosition / 100)}`

    if (cursorSection !== section) {
      setSection(cursorSection)
      await predictConflicts(cursorSection)
    }
  }

  // Handle conflict resolution
  const handleResolveConflict = async (strategy: string, resolvedContent: string, reasoning?: string) => {
    if (!currentConflict) return

    try {
      await resolveConflict(currentConflict.id, strategy as any, resolvedContent, reasoning)

      // Update editor content with resolved content
      setContent(resolvedContent)
      setLastSavedContent(resolvedContent)

      toast({
        title: "Conflict Resolved",
        description: "The editing conflict has been successfully resolved.",
      })
    } catch (error) {
      console.error("Error resolving conflict:", error)
      toast({
        title: "Error",
        description: "Failed to resolve the conflict. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle coordination request
  const handleCoordinate = () => {
    toast({
      title: "Coordination Request Sent",
      description: "Other users have been notified about your editing intentions.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="outline">Document: {documentId}</Badge>
          <Badge variant="outline">Type: {documentType}</Badge>
        </div>

        <div className="flex items-center space-x-2">
          {activeConflicts.length > 0 && (
            <Badge variant="destructive" className="flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {activeConflicts.length} Conflict(s)
            </Badge>
          )}

          <div className="flex -space-x-2">
            {collaborators.map((collaborator) => (
              <Avatar key={collaborator.id} className="border-2 border-background h-8 w-8">
                <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-xs">
                  {collaborator.name.charAt(0)}
                </div>
              </Avatar>
            ))}
            <Avatar className="border-2 border-background h-8 w-8 bg-green-100">
              <div className="bg-green-500 text-white w-full h-full flex items-center justify-center text-xs">
                {userName.charAt(0)}
              </div>
            </Avatar>
          </div>

          <Badge variant="outline" className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {collaborators.length + 1} Users
          </Badge>
        </div>
      </div>

      <Textarea
        ref={contentRef}
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        onKeyUp={handleCursorPositionChange}
        onClick={handleCursorPositionChange}
        className="min-h-[300px] font-mono text-sm"
        placeholder="Start typing..."
      />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || content === lastSavedContent}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Conflict resolution dialog */}
      {currentConflict && (
        <IntelligentConflictDialog
          conflict={currentConflict}
          suggestions={suggestions}
          isResolving={isResolving}
          onResolve={handleResolveConflict}
          onClose={() => setConflict(null)}
        />
      )}

      {/* Conflict prediction alert */}
      <ConflictPredictionAlert
        prediction={prediction}
        onDismiss={() => setPrediction(null)}
        onCoordinate={handleCoordinate}
      />
    </div>
  )
}
