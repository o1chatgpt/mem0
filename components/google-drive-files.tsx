"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText,
  RefreshCw,
  Folder,
  File,
  ImageIcon as Image,
  FileSpreadsheet,
  FileIcon as FilePresentation,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface GoogleDriveFilesProps {
  integration: any
}

export function GoogleDriveFiles({ integration }: GoogleDriveFilesProps) {
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/integrations/google-drive/files", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch files")
      }

      const data = await response.json()
      setFiles(data.files || [])
    } catch (err) {
      setError("Error fetching files. Please check your connection and try again.")
      toast({
        title: "Error",
        description: "Failed to fetch Google Drive files",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (integration?.is_active && integration?.config?.access_token) {
      fetchFiles()
    }
  }, [integration])

  const getFileIcon = (mimeType: string) => {
    if (mimeType === "application/vnd.google-apps.folder") return <Folder className="h-6 w-6 text-yellow-500" />
    if (mimeType === "application/vnd.google-apps.document") return <FileText className="h-6 w-6 text-blue-500" />
    if (mimeType === "application/vnd.google-apps.spreadsheet")
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />
    if (mimeType === "application/vnd.google-apps.presentation")
      return <FilePresentation className="h-6 w-6 text-orange-500" />
    if (mimeType.startsWith("image/")) return <Image className="h-6 w-6 text-purple-500" />
    return <File className="h-6 w-6 text-gray-500" />
  }

  if (!integration?.is_active || !integration?.config?.access_token) {
    return (
      <Card className="bg-background border-gray-800">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-300 mb-4">Connect your Google Drive account to view your files.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-background border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          Google Drive Files
        </CardTitle>
        <CardDescription className="text-gray-400">Recent files from your Google Drive</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-red-400 mb-4">{error}</p>
            <Button variant="outline" onClick={fetchFiles} className="border-gray-700 text-white">
              Try Again
            </Button>
          </div>
        ) : files.length === 0 ? (
          <p className="text-center text-gray-400 py-6">No files found</p>
        ) : (
          <div className="space-y-2">
            {files.slice(0, 5).map((file) => (
              <div key={file.id} className="flex items-center p-2 rounded-md hover:bg-secondary">
                {getFileIcon(file.mimeType)}
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{new Date(file.modifiedTime).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full border-gray-700 text-white hover:bg-secondary"
          onClick={fetchFiles}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Files
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
