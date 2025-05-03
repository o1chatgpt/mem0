"use client"

import { useState, useEffect } from "react"
import { useCrewAI } from "@/components/crew-ai-provider"
import { NetworkErrorAlert } from "@/components/network-error-alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function FilesPage() {
  const { tasks, loading, error, networkError, retryFetch } = useCrewAI()
  const [files, setFiles] = useState<any[]>([])

  useEffect(() => {
    // Convert tasks to files for display
    if (tasks && tasks.length > 0) {
      const filesList = tasks.map((task) => ({
        id: task.id,
        name: task.title,
        description: task.description,
        status: task.status,
        createdAt: task.created_at,
      }))
      setFiles(filesList)
    } else {
      setFiles([])
    }
  }, [tasks])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Files</h1>

      {networkError && <NetworkErrorAlert onRetry={retryFetch} />}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : files.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <Card key={file.id}>
              <CardHeader>
                <CardTitle>{file.name}</CardTitle>
                <CardDescription>Created: {new Date(file.createdAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{file.description}</p>
              </CardContent>
              <CardFooter>
                <div className="flex justify-between w-full">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      file.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : file.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {file.status}
                  </span>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No files found</p>
          <Button>Upload a File</Button>
        </div>
      )}
    </div>
  )
}
