"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, FileText, RefreshCw } from "lucide-react"
import { useAppContext } from "@/lib/app-context"
import { useCollaborativeEditing } from "@/hooks/use-collaborative-editing"

export function RealtimeConflictDashboard() {
  const { selectedFile } = useAppContext()
  const { isInitialized, isConnected, collaborators } = useCollaborativeEditing(selectedFile?.id)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [isInitialized, isConnected])

  if (!selectedFile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Select a file to view collaboration status</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Realtime Collaboration Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <h3 className="text-lg font-medium">{selectedFile.name}</h3>
                {isConnected ? (
                  <Badge variant="outline" className="ml-2 bg-green-100">
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="ml-2">
                    Disconnected
                  </Badge>
                )}
              </div>
            </div>

            {collaborators.size > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Active Collaborators:</h4>
                <ul className="list-disc pl-5">
                  {Array.from(collaborators.values()).map((collaborator) => (
                    <li key={collaborator.id} className="text-sm">
                      {collaborator.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <Alert>
                <AlertDescription>No active collaborators for this file.</AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
