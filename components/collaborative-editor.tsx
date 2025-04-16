"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAppContext } from "@/lib/app-context"
import { useCollaborativeEditing } from "@/hooks/use-collaborative-editing"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Users, UserPlus, UserMinus, Save, AlertTriangle, Clock, Share2, Check } from "lucide-react"
import type { CollaborationUser } from "@/lib/collaborative-editing-service"

export function CollaborativeEditor() {
  const { selectedFile, fileContent, setFileContent, saveFile } = useAppContext()
  const {
    isInitialized,
    isConnected,
    activeSessions,
    currentSession,
    operations,
    error,
    createSession,
    joinSession,
    leaveSession,
    sendInsert,
    sendDelete,
    sendCursorPosition,
    sendSelection,
  } = useCollaborativeEditing(selectedFile?.id)

  const [localContent, setLocalContent] = useState(fileContent)
  const [isSaving, setIsSaving] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)
  const [userCursors, setUserCursors] = useState<Map<string, { user: CollaborationUser; element: HTMLElement | null }>>(
    new Map(),
  )

  const editorRef = useRef<HTMLTextAreaElement>(null)
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
        } else if (operation.type === "cursor" && operation.cursor) {
          // Update user cursor position
          updateUserCursor(operation.userId, operation.cursor)
        } else if (operation.type === "selection" && operation.selection) {
          // Update user selection
          updateUserSelection(operation.userId, operation.selection)
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
        toast({
          title: "Joined Collaboration",
          description: `You've joined a collaborative editing session with ${
            activeSessions[0].activeUsers.length
          } other user${activeSessions[0].activeUsers.length !== 1 ? "s" : ""}.`,
        })
      } else {
        // Create a new session
        await createSession(selectedFile.name)
        toast({
          title: "Started Collaboration",
          description: "You've started a new collaborative editing session. Share the link to invite others.",
        })
      }
    } catch (err) {
      console.error("Failed to start collaboration:", err)
      toast({
        title: "Collaboration Error",
        description: "Failed to start or join collaboration session.",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  // Leave collaboration session
  const handleLeaveCollaboration = async () => {
    setIsLeaving(true)
    try {
      await leaveSession()
      toast({
        title: "Left Collaboration",
        description: "You've left the collaborative editing session.",
      })
    } catch (err) {
      console.error("Failed to leave collaboration:", err)
      toast({
        title: "Collaboration Error",
        description: "Failed to leave collaboration session.",
        variant: "destructive",
      })
    } finally {
      setIsLeaving(false)
    }
  }

  // Handle save
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveFile()
      toast({
        title: "File Saved",
        description: "Your changes have been saved successfully.",
      })
    } catch (err) {
      console.error("Error saving file:", err)
      toast({
        title: "Save Error",
        description: "Failed to save the file. Please try again.",
        variant: "destructive",
      })
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

  // Handle cursor position change
  const handleCursorPositionChange = () => {
    if (!editorRef.current || !currentSession) return

    const textarea = editorRef.current
    const cursorPosition = textarea.selectionStart

    // Convert cursor position to line and character
    const textBeforeCursor = textarea.value.substring(0, cursorPosition)
    const lines = textBeforeCursor.split("\n")
    const line = lines.length - 1
    const ch = lines[lines.length - 1].length

    // Send cursor position update
    sendCursorPosition(line, ch)
  }

  // Handle selection change
  const handleSelectionChange = () => {
    if (!editorRef.current || !currentSession) return

    const textarea = editorRef.current
    const selectionStart = textarea.selectionStart
    const selectionEnd = textarea.selectionEnd

    if (selectionStart === selectionEnd) {
      // No selection, just update cursor
      handleCursorPositionChange()
      return
    }

    // Convert selection to line and character positions
    const textBeforeStart = textarea.value.substring(0, selectionStart)
    const linesBeforeStart = textBeforeStart.split("\n")
    const startLine = linesBeforeStart.length - 1
    const startCh = linesBeforeStart[linesBeforeStart.length - 1].length

    const textBeforeEnd = textarea.value.substring(0, selectionEnd)
    const linesBeforeEnd = textBeforeEnd.split("\n")
    const endLine = linesBeforeEnd.length - 1
    const endCh = linesBeforeEnd[linesBeforeEnd.length - 1].length

    // Send selection update
    sendSelection({ line: startLine, ch: startCh }, { line: endLine, ch: endCh })
  }

  // Update user cursor position
  const updateUserCursor = (userId: string, cursor: { line: number; ch: number }) => {
    if (!currentSession) return

    const user = currentSession.activeUsers.find((u) => u.id === userId)
    if (!user) return

    // Get or create cursor element
    let cursorMap = userCursors.get(userId)

    if (!cursorMap) {
      // Create new cursor element
      const cursorElement = document.createElement("div")
      cursorElement.className = "absolute w-0.5 h-5 animate-pulse"
      cursorElement.style.backgroundColor = user.color
      cursorElement.style.zIndex = "50"

      // Add user name tooltip
      const tooltip = document.createElement("div")
      tooltip.className = "absolute bottom-full mb-1 px-2 py-1 text-xs rounded bg-gray-800 text-white whitespace-nowrap"
      tooltip.textContent = user.name
      tooltip.style.left = "-1rem"
      cursorElement.appendChild(tooltip)

      document.body.appendChild(cursorElement)

      cursorMap = {
        user,
        element: cursorElement,
      }

      setUserCursors(new Map(userCursors.set(userId, cursorMap)))
    }

    // Position cursor element
    if (cursorMap.element && editorRef.current) {
      // This is a simplified positioning algorithm - in a real app, you'd need more sophisticated positioning
      const textarea = editorRef.current
      const text = textarea.value
      const lines = text.split("\n")

      // Calculate position
      let position = 0
      for (let i = 0; i < cursor.line; i++) {
        position += lines[i].length + 1 // +1 for newline
      }
      position += cursor.ch

      // Get cursor coordinates
      const textBeforeCursor = text.substring(0, position)

      // Create a temporary element to measure text dimensions
      const temp = document.createElement("div")
      temp.style.position = "absolute"
      temp.style.visibility = "hidden"
      temp.style.whiteSpace = "pre-wrap"
      temp.style.font = window.getComputedStyle(textarea).font
      temp.style.width = window.getComputedStyle(textarea).width
      temp.style.padding = window.getComputedStyle(textarea).padding
      temp.textContent = textBeforeCursor

      document.body.appendChild(temp)

      // Create a span for the last character
      const span = document.createElement("span")
      span.textContent = "|"
      temp.appendChild(span)

      // Get position
      const rect = span.getBoundingClientRect()
      const textareaRect = textarea.getBoundingClientRect()

      // Position cursor
      cursorMap.element.style.left = `${rect.left - textareaRect.left + textarea.scrollLeft}px`
      cursorMap.element.style.top = `${rect.top - textareaRect.top + textarea.scrollTop}px`

      // Clean up
      document.body.removeChild(temp)
    }
  }

  // Update user selection
  const updateUserSelection = (
    userId: string,
    selection: { from: { line: number; ch: number }; to: { line: number; ch: number } },
  ) => {
    // Similar to updateUserCursor but for selections
    // This would be more complex in a real implementation
    console.log("Selection update:", userId, selection)
  }

  // Clean up cursors when unmounting
  useEffect(() => {
    return () => {
      // Remove all cursor elements
      userCursors.forEach((cursor) => {
        if (cursor.element) {
          document.body.removeChild(cursor.element)
        }
      })
    }
  }, [userCursors])

  // Copy collaboration link
  const handleCopyLink = () => {
    if (!currentSession) return

    const url = new URL(window.location.href)
    url.searchParams.set("collaboration", currentSession.id)

    navigator.clipboard.writeText(url.toString())
    setHasCopied(true)

    setTimeout(() => {
      setHasCopied(false)
    }, 2000)

    toast({
      title: "Link Copied",
      description: "Collaboration link copied to clipboard. Share it to invite others.",
    })
  }

  // Check for collaboration link in URL on mount
  useEffect(() => {
    if (!isInitialized) return

    const checkForCollaborationLink = async () => {
      const url = new URL(window.location.href)
      const sessionId = url.searchParams.get("collaboration")

      if (sessionId && !currentSession) {
        setIsJoining(true)
        try {
          await joinSession(sessionId)
          toast({
            title: "Joined Collaboration",
            description: "You've joined a collaborative editing session via shared link.",
          })
        } catch (err) {
          console.error("Failed to join collaboration from link:", err)
          toast({
            title: "Collaboration Error",
            description: "Failed to join collaboration session from link.",
            variant: "destructive",
          })
        } finally {
          setIsJoining(false)
        }
      }
    }

    checkForCollaborationLink()
  }, [isInitialized, currentSession, joinSession])

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
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleCopyLink}>
                      {hasCopied ? <Check className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
                      {hasCopied ? "Copied" : "Share"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy collaboration link to invite others</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button variant="outline" size="sm" onClick={handleLeaveCollaboration} disabled={isLeaving}>
                <UserMinus className="h-4 w-4 mr-2" />
                {isLeaving ? "Leaving..." : "Leave Collaboration"}
              </Button>
            </>
          )}

          <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {currentSession && (
        <div className="mb-4 p-2 bg-muted rounded-md flex items-center">
          <span className="text-sm font-medium mr-2">Collaborators:</span>
          <div className="flex -space-x-2 overflow-hidden">
            {currentSession.activeUsers.map((user) => (
              <TooltipProvider key={user.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="border-2 border-background" style={{ borderColor: user.color }}>
                      <AvatarFallback style={{ backgroundColor: user.color }}>
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(user.lastActive).toLocaleTimeString()}
                      </span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}

      <Textarea
        ref={editorRef}
        value={localContent}
        onChange={handleContentChange}
        onKeyUp={handleCursorPositionChange}
        onClick={handleCursorPositionChange}
        onSelect={handleSelectionChange}
        className="min-h-[500px] font-mono"
        placeholder="Enter file content here..."
      />
    </div>
  )
}
