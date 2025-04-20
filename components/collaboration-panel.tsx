"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, UserPlus, Share2, MessageSquare, Clock } from "lucide-react"
import { collaborationService, type CollaborationSession } from "@/lib/collaboration-service"
import { useToast } from "@/components/ui/use-toast"

interface CollaborationPanelProps {
  fileId?: string
  fileName?: string
}

export function CollaborationPanel({ fileId, fileName }: CollaborationPanelProps) {
  const { toast } = useToast()
  const [sessions, setSessions] = useState<CollaborationSession[]>([])
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize collaboration service with user info
    // In a real app, this would come from auth context
    const userId = "user-1"
    const username = "Current User"

    try {
      collaborationService.initialize(userId, username)
      setIsConnected(collaborationService.isConnected())

      // Subscribe to message events
      const unsubscribe = collaborationService.onMessage((data) => {
        if (data.type === "session_update") {
          // Update sessions list
          setSessions(collaborationService.getAllSessions())

          // Update current session if it's the one we're in
          if (currentSession && data.session.id === currentSession.id) {
            setCurrentSession(data.session)
          }
        }
      })

      // Initial sessions load
      setSessions(collaborationService.getAllSessions())

      return () => {
        unsubscribe()
        collaborationService.disconnect()
      }
    } catch (error) {
      console.error("Error initializing collaboration:", error)
    }
  }, [])

  // Join session when file changes
  useEffect(() => {
    if (!fileId || !isConnected) return

    try {
      // Join or create session for this file
      const sessionId = collaborationService.joinSession(fileId)

      // Get session details
      const session = collaborationService.getSession(sessionId)
      if (session) {
        setCurrentSession(session)
      }

      return () => {
        // Leave session when component unmounts or file changes
        if (sessionId) {
          collaborationService.leaveSession(sessionId)
          setCurrentSession(null)
        }
      }
    } catch (error) {
      console.error("Error joining collaboration session:", error)
      toast({
        title: "Collaboration Error",
        description: "Failed to join collaboration session",
        variant: "destructive",
      })
    }
  }, [fileId, isConnected, toast])

  const handleInviteUser = () => {
    if (!currentSession) return

    // Generate a shareable link
    const shareUrl = `${window.location.origin}/collaborate?session=${currentSession.id}`

    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl)

    toast({
      title: "Invite Link Copied",
      description: "Collaboration link copied to clipboard",
    })
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collaboration</CardTitle>
          <CardDescription>Real-time collaboration is not available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Real-time collaboration is disabled or not available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Collaboration</span>
          {currentSession && (
            <Badge variant="outline" className="ml-2">
              <Clock className="h-3 w-3 mr-1" />
              Live
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{fileName ? `Collaborating on ${fileName}` : "Select a file to collaborate"}</CardDescription>
      </CardHeader>

      <CardContent>
        {!currentSession ? (
          <div className="text-center py-4">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {fileId ? "Starting collaboration session..." : "Select a file to start collaborating"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Active Users</h4>
              <div className="flex -space-x-2">
                {currentSession.users.map((user) => (
                  <Avatar key={user.id} className="border-2 border-background" style={{ backgroundColor: user.color }}>
                    <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
                <Button variant="outline" size="icon" className="rounded-full h-8 w-8 ml-2" onClick={handleInviteUser}>
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Actions</h4>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleInviteUser}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Invite
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
