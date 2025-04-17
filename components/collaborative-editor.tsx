"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAppContext } from "@/lib/app-context"
import { useCollaborativeEditing } from "@/hooks/use-collaborative-editing"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, UserMinus, Save } from "lucide-react"

export function CollaborativeEditor() {
  const { selectedFile, fileContent, setFileContent, saveFile } = useAppContext()
  const {
    isInitialized,
    activeSessions,
    currentSession,
    operations,
    createSession,
    joinSession,
    leaveSession,
    sendInsert,
    sendDelete,
  } = useCollaborativeEditing(selectedFile?.id)

  const [localContent, setLocalContent] = useState(fileContent)
  const [isSaving, setIsSaving] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const lastContentRef = useRef(fileContent)
  const isApplyingOperationRef = useRef(false)

  // Initialize local content when file content changes
  useEffect(() => {
    if (fileContent !== lastContentRef.current) {
      setLocalContent(fileContent)
      lastContentRef.current = fileContent
    }
  }, [fileContent])

  // Apply incoming operations to the editor
  useEffect(() => {
    if (!operations.length || !currentSession || isApplyingOperationRef.current) return

    // Process only the latest operations
    const latestOperations = operations.slice(-10)

    latestOperations.forEach((operation) => {
      // Skip our own operations
      if (operation.userId === currentSession.activeUsers.find((u) => u.id === operation.userId)?.id) return

      isApplyingOperationRef.current = true

      try {
        if (operation.type === "insert" && operation.position !== undefined && operation.text) {
          // Apply insert operation
          setLocalContent((prev) => {
            const newContent = prev.slice(0, operation.position) + operation.text + prev.slice(operation.position)
            lastContentRef.current = newContent
            return newContent
          })
        } else if (operation.type === "delete" && operation.position !== undefined && operation.text) {
          // Apply delete operation
          setLocalContent((prev) => {
            const newContent =
              prev.slice(0, operation.position) + prev.slice(operation.position + operation.text.length)
            lastContentRef.current = newContent
            return newContent
          })
        }
      } finally {
        isApplyingOperationRef.current = false
      }
    })
  }, [operations, currentSession])

  // Update editor content when local content changes
  useEffect(() => {
    if (localContent !== fileContent && !isApplyingOperationRef.current) {
      setFileContent(localContent)
    }
  }, [localContent, fileContent, setFileContent])

  // Create or join session
  const handleStartCollaboration = async () => {
    if (!selectedFile) return

    setIsJoining(true)
    try {
      // Check if there are active sessions for this file
      if (activeSessions.length > 0) {
        // Join the first active session
        await joinSession(activeSessions[0].id)
        console.log("Joined collaboration session")
      } else {
        // Create a new session
        await createSession(selectedFile.name)
        console.log("Started new collaboration session")
      }
    } catch (err) {
      console.error("Failed to start collaboration:", err)
    } finally {
      setIsJoining(false)
    }
  }

  // Leave collaboration session
  const handleLeaveCollaboration = async () => {
    setIsLeaving(true)
    try {
      await leaveSession()
      console.log("Left collaboration session")
    } catch (err) {
      console.error("Failed to leave collaboration:", err)
    } finally {
      setIsLeaving(false)
    }
  }

  // Handle save
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveFile()
      console.log("File saved successfully")
    } catch (err) {
      console.error("Error saving file:", err)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    const oldContent = localContent

    // Find the difference and send operations
    if (!isApplyingOperationRef.current && currentSession) {
      // This is a simplified diff algorithm - in a real app, you'd use a more sophisticated approach
      if (newContent.length > oldContent.length) {
        // Text was added
        let i = 0
        while (i < oldContent.length && oldContent[i] === newContent[i]) i++
        const insertedText = newContent.slice(i, i + (newContent.length - oldContent.length))
        sendInsert(i, insertedText)
      } else if (newContent.length < oldContent.length) {
        // Text was removed
        let i = 0
        while (i < newContent.length && oldContent[i] === newContent[i]) i++
        const deletedText = oldContent.slice(i, i + (oldContent.length - newContent.length))
        sendDelete(i, deletedText)
      }
    }

    setLocalContent(newContent)
  }

  if (!selectedFile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-muted/20">
        <div className="text-center">
          <Users className="h-16 w-16 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No file selected</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Select a file from the explorer to start collaborative editing
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold">{selectedFile.name}</h2>
          {currentSession && (
            <Badge variant="outline" className="ml-2 bg-green-100">
              <Users className="h-4 w-4 mr-1" />
              Collaborative
            </Badge>
          )}
        </div>

        <div className="flex space-x-2">
          {!currentSession ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartCollaboration}
              disabled={isJoining || !isInitialized}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {isJoining ? "Joining..." : activeSessions.length > 0 ? "Join Collaboration" : "Start Collaboration"}
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleLeaveCollaboration} disabled={isLeaving}>
              <UserMinus className="h-4 w-4 mr-2" />
              {isLeaving ? "Leaving..." : "Leave Collaboration"}
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {currentSession && (
        <div className="mb-4 p-2 bg-muted rounded-md flex items-center">
          <span className="text-sm font-medium mr-2">Collaborators:</span>
          <div className="flex space-x-2">
            {currentSession.activeUsers.map((user) => (
              <div
                key={user.id}
                className="px-2 py-1 rounded-full text-xs"
                style={{ backgroundColor: user.color, color: "#fff" }}
              >
                {user.name}
              </div>
            ))}
          </div>
        </div>
      )}

      <Textarea
        value={localContent}
        onChange={handleContentChange}
        className="min-h-[500px] font-mono"
        placeholder="Enter file content here..."
      />
    </div>
  )
}
