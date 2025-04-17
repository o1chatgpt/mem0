"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAppContext } from "@/lib/app-context"
import { useCollaborativeEditing } from "@/hooks/use-collaborative-editing"
import { useConflictResolution } from "@/hooks/use-conflict-resolution"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, UserMinus, Save, Wifi, WifiOff, AlertTriangle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Memory } from "@/lib/mem0-client"
import { ConflictResolutionDialog } from "@/components/conflict-resolution-dialog"
import type { ConflictInfo, ResolutionStrategy } from "@/lib/conflict-resolution-service"

export function CollaborativeEditor() {
  const { selectedFile, fileContent, setFileContent, saveFile } = useAppContext()
  const {
    isInitialized,
    isConnected,
    activeSessions,
    currentSession,
    operations,
    collaborators,
    createSession,
    joinSession,
    leaveSession,
    sendInsert,
    sendDelete,
  } = useCollaborativeEditing(selectedFile?.id)

  const { activeConflicts, preferences, getSuggestions, resolveAutomatically, resolveManually } =
    useConflictResolution()

  const [localContent, setLocalContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [cursorPositions, setCursorPositions] = useState<
    Map<string, { position: number; selection: [number, number] | null }>
  >(new Map())
  const [lastCursorPosition, setLastCursorPosition] = useState<number>(0)
  const [lastSelection, setLastSelection] = useState<[number, number] | null>(null)
  const [memoryInitialized, setMemoryInitialized] = useState(false)
  const [activeConflict, setActiveConflict] = useState<ConflictInfo | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isApplyingOperationRef = useRef(false)
  const memory = useRef<Memory | null>(null)

  // Initialize Mem0 memory
  useEffect(() => {
    if (!memoryInitialized) {
      memory.current = new Memory()
      setMemoryInitialized(true)
    }
  }, [memoryInitialized])

  // Update local content when file content changes
  useEffect(() => {
    if (fileContent) {
      setLocalContent(fileContent)
    }
  }, [fileContent])

  // Handle conflicts
  useEffect(() => {
    if (activeConflicts.length > 0 && !activeConflict) {
      // Find first unresolved conflict
      const conflict = activeConflicts.find((c) => !c.resolved)
      if (conflict) {
        setActiveConflict(conflict)
      }
    }
  }, [activeConflicts, activeConflict])

  // Apply incoming operations to the editor
  useEffect(() => {
    if (!operations.length || !currentSession) return

    // Process only the latest operation
    const latestOperation = operations[operations.length - 1]

    // Skip our own operations
    if (latestOperation.userId === currentSession.activeUsers.find((u) => u.id === latestOperation.userId)?.id) return

    isApplyingOperationRef.current = true

    try {
      if (latestOperation.type === "insert" && latestOperation.position !== undefined && latestOperation.text) {
        // Apply insert operation
        setLocalContent((prev) => {
          const newContent =
            prev.slice(0, latestOperation.position) + latestOperation.text + prev.slice(latestOperation.position)
          return newContent
        })

        // Store in Mem0 for learning patterns
        if (memory.current && latestOperation.userName) {
          memory.current.add(
            [
              { role: "system", content: "Collaborative editing observation" },
              {
                role: "user",
                content: `User ${latestOperation.userName} inserted text at position ${latestOperation.position}`,
              },
            ],
            latestOperation.userId,
          )
        }
      } else if (latestOperation.type === "delete" && latestOperation.position !== undefined && latestOperation.text) {
        // Apply delete operation
        setLocalContent((prev) => {
          const newContent =
            prev.slice(0, latestOperation.position) + prev.slice(latestOperation.position + latestOperation.text.length)
          return newContent
        })

        // Store in Mem0 for learning patterns
        if (memory.current && latestOperation.userName) {
          memory.current.add(
            [
              { role: "system", content: "Collaborative editing observation" },
              {
                role: "user",
                content: `User ${latestOperation.userName} deleted text at position ${latestOperation.position}`,
              },
            ],
            latestOperation.userId,
          )
        }
      }
    } finally {
      setTimeout(() => {
        isApplyingOperationRef.current = false
      }, 0)
    }
  }, [operations, currentSession])

  // Update file content when local content changes
  useEffect(() => {
    if (localContent && !isApplyingOperationRef.current) {
      setFileContent(localContent)
    }
  }, [localContent, setFileContent])

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

        // Store in Mem0
        if (memory.current) {
          memory.current.add([
            { role: "system", content: "Collaboration action" },
            { role: "user", content: `User joined an existing collaboration session for file ${selectedFile.name}` },
          ])
        }
      } else {
        // Create a new session
        await createSession(selectedFile.name)
        console.log("Started new collaboration session")

        // Store in Mem0
        if (memory.current) {
          memory.current.add([
            { role: "system", content: "Collaboration action" },
            { role: "user", content: `User created a new collaboration session for file ${selectedFile.name}` },
          ])
        }
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

      // Store in Mem0
      if (memory.current && selectedFile) {
        memory.current.add([
          { role: "system", content: "Collaboration action" },
          { role: "user", content: `User left the collaboration session for file ${selectedFile.name}` },
        ])
      }
    } catch (err) {
      console.error("Failed to leave collaboration:", err)
    } finally {
      setIsLeaving(false)
    }
  }

  // Handle save
  const handleSave = async () => {
    if (!selectedFile) return

    setIsSaving(true)
    try {
      setFileContent(localContent)
      await saveFile()
      console.log("File saved successfully")

      // Store in Mem0
      if (memory.current) {
        memory.current.add([
          { role: "system", content: "File action" },
          { role: "user", content: `User saved file ${selectedFile.name}` },
        ])
      }
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

    // Get cursor position
    const cursorPosition = e.target.selectionStart
    setLastCursorPosition(cursorPosition)

    // Get selection
    const selectionStart = e.target.selectionStart
    const selectionEnd = e.target.selectionEnd
    setLastSelection(selectionStart !== selectionEnd ? [selectionStart, selectionEnd] : null)

    // Find the difference and send operations
    if (!isApplyingOperationRef.current && currentSession) {
      // This is a simplified diff algorithm - in a real app, you'd use a more sophisticated approach
      if (newContent.length > oldContent.length) {
        // Text was added
        let i = 0
        // Find the position where the text differs
        while (i < oldContent.length && oldContent[i] === newContent[i]) i++
        const insertedText = newContent.slice(i, i + (newContent.length - oldContent.length))
        sendInsert(i, insertedText)
      } else if (newContent.length < oldContent.length) {
        // Text was removed
        let i = 0
        // Find the position where the text differs
        while (i < newContent.length && oldContent[i] === newContent[i]) i++
        const deletedText = oldContent.slice(i, i + (oldContent.length - newContent.length))
        sendDelete(i, deletedText)
      }
    }

    setLocalContent(newContent)
  }

  // Handle cursor position changes
  const handleSelectionChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    if (!currentSession || !isConnected) return

    const textarea = e.target as HTMLTextAreaElement
    const position = textarea.selectionStart
    const selection =
      textarea.selectionStart !== textarea.selectionEnd
        ? ([textarea.selectionStart, textarea.selectionEnd] as [number, number])
        : null

    setLastCursorPosition(position)
    setLastSelection(selection)

    // In a real implementation, you would broadcast cursor position to other users
    // This would require extending the WebSocket protocol to handle cursor positions
  }

  // Handle conflict resolution
  const handleResolveConflictAuto = async (strategy: ResolutionStrategy) => {
    if (!activeConflict) return

    try {
      await resolveAutomatically(activeConflict.id, strategy)

      // Store in Mem0
      if (memory.current) {
        memory.current.add([
          { role: "system", content: "Conflict resolution" },
          { role: "user", content: `User resolved conflict automatically using ${strategy} strategy` },
        ])
      }

      setActiveConflict(null)
    } catch (error) {
      console.error("Error resolving conflict:", error)
    }
  }

  const handleResolveConflictManual = async (userId?: string, customText?: string) => {
    if (!activeConflict) return

    try {
      await resolveManually(activeConflict.id, userId, customText)

      // If custom text was provided, update the editor content
      if (customText) {
        const conflict = activeConflict
        const position = conflict.conflictPosition

        // Apply the custom text to the editor
        setLocalContent((prev) => {
          const beforeConflict = prev.slice(0, position)
          const afterConflict = prev.slice(position + conflict.conflictLength)
          return beforeConflict + customText + afterConflict
        })
      }

      // Store in Mem0
      if (memory.current) {
        memory.current.add([
          { role: "system", content: "Conflict resolution" },
          {
            role: "user",
            content: userId
              ? `User resolved conflict manually by selecting ${userId}'s changes`
              : "User resolved conflict manually with custom text",
          },
        ])
      }

      setActiveConflict(null)
    } catch (error) {
      console.error("Error resolving conflict:", error)
    }
  }

  // Render collaborator cursors (simplified version)
  const renderCollaboratorCursors = () => {
    if (!currentSession || !textareaRef.current) return null

    return Array.from(cursorPositions.entries()).map(([userId, data]) => {
      const user = collaborators.get(userId)
      if (!user) return null

      // In a real implementation, you would calculate the exact position
      // This is a simplified placeholder
      return (
        <div
          key={userId}
          className="absolute pointer-events-none"
          style={{
            top: "0px",
            left: "0px",
            color: user.color,
          }}
        >
          {user.name}
        </div>
      )
    })
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2">
                  {isConnected ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {isConnected ? "Connected to real-time server" : "Disconnected from real-time server"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {activeConflicts.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="ml-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>{activeConflicts.length} editing conflict(s) detected</TooltipContent>
              </Tooltip>
            </TooltipProvider>
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

      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={localContent}
          onChange={handleContentChange}
          onSelect={handleSelectionChange}
          className="min-h-[500px] font-mono"
          placeholder="Enter file content here..."
        />
        {renderCollaboratorCursors()}
      </div>

      {/* Conflict Resolution Dialog */}
      <ConflictResolutionDialog
        conflict={activeConflict}
        suggestions={activeConflict ? getSuggestions(activeConflict.id) : []}
        onResolveAuto={handleResolveConflictAuto}
        onResolveManual={handleResolveConflictManual}
        onClose={() => setActiveConflict(null)}
      />
    </div>
  )
}
