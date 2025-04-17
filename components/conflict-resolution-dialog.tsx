"use client"

import { useState, useEffect } from "react"
import type { Conflict } from "@/lib/conflict-resolution-service"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"

interface ConflictResolutionDialogProps {
  conflict: Conflict
  currentUserId: string
  onResolve: (resolution: "user-a" | "user-b" | "merge" | "custom", customContent?: string) => Promise<void>
  onCancel: () => void
}

export function ConflictResolutionDialog({
  conflict,
  currentUserId,
  onResolve,
  onCancel,
}: ConflictResolutionDialogProps) {
  const [resolution, setResolution] = useState<"user-a" | "user-b" | "merge" | "custom">("merge")
  const [customContent, setCustomContent] = useState("")
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Determine if current user is userA or userB
  const isUserA = currentUserId === conflict.userA.id
  const currentUserContent = isUserA ? conflict.userA.content : conflict.userB.content
  const otherUserContent = isUserA ? conflict.userB.content : conflict.userA.content
  const otherUserName = isUserA ? conflict.userB.name : conflict.userA.name

  // Get suggestion when component mounts
  useEffect(() => {
    const getSuggestion = async () => {
      try {
        const response = await fetch(`/api/conflicts/suggest?conflictId=${conflict.id}&userId=${currentUserId}`)

        if (response.ok) {
          const data = await response.json()
          setSuggestion(data.suggestion)
          setCustomContent(data.suggestion)
        }
      } catch (error) {
        console.error("Error getting suggestion:", error)
      }
    }

    getSuggestion()
  }, [conflict.id, currentUserId])

  const handleResolve = async () => {
    setIsLoading(true)
    try {
      await onResolve(resolution, resolution === "custom" ? customContent : undefined)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Resolve Editing Conflict</span>
            <Badge variant="outline" className="ml-2">
              {new Date(conflict.timestamp).toLocaleString()}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>There is a conflict between your changes and {otherUserName}'s changes.</p>
            {suggestion && (
              <p className="mt-2">
                Based on your previous choices, we suggest using the{" "}
                {resolution === "user-a" ? "your" : resolution === "user-b" ? "their" : "merged"} version.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center mb-2">
                <Avatar className="h-6 w-6 mr-2">
                  <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-xs">
                    {isUserA ? "You" : conflict.userA.name.charAt(0)}
                  </div>
                </Avatar>
                <span className="text-sm font-medium">
                  {isUserA ? "Your version" : `${conflict.userA.name}'s version`}
                </span>
              </div>
              <div className="border rounded-md p-3 bg-muted/50 text-sm h-40 overflow-auto whitespace-pre-wrap">
                {conflict.userA.content}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setResolution("user-a")}
                disabled={isLoading}
              >
                Use this version
              </Button>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <Avatar className="h-6 w-6 mr-2">
                  <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-xs">
                    {!isUserA ? "You" : conflict.userB.name.charAt(0)}
                  </div>
                </Avatar>
                <span className="text-sm font-medium">
                  {!isUserA ? "Your version" : `${conflict.userB.name}'s version`}
                </span>
              </div>
              <div className="border rounded-md p-3 bg-muted/50 text-sm h-40 overflow-auto whitespace-pre-wrap">
                {conflict.userB.content}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setResolution("user-b")}
                disabled={isLoading}
              >
                Use this version
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Custom resolution</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setResolution("merge")
                  setCustomContent(suggestion || "")
                }}
                disabled={isLoading}
              >
                Use suggested merge
              </Button>
            </div>
            <Textarea
              value={customContent}
              onChange={(e) => {
                setCustomContent(e.target.value)
                setResolution("custom")
              }}
              className="min-h-[100px]"
              placeholder="Edit to create a custom resolution..."
              disabled={isLoading}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleResolve} disabled={isLoading}>
            {isLoading ? "Resolving..." : "Apply Resolution"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
