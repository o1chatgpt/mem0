"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { shareService, type SharedFile } from "@/lib/share-service"
import type { FileInfo } from "@/lib/file-service"
import { FileServiceImpl } from "@/lib/file-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText,
  Lock,
  Download,
  ArrowLeft,
  Eye,
  Calendar,
  Clock,
  AlertCircle,
  FileIcon,
  ImageIcon,
  FileSpreadsheet,
  Code,
  Pencil,
  Save,
  X,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

export default function SharedFilePage() {
  const params = useParams()
  const router = useRouter()
  const shareId = params.shareId as string

  const [sharedFile, setSharedFile] = useState<SharedFile | null>(null)
  const [file, setFile] = useState<FileInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [isPasswordVerified, setIsPasswordVerified] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState("")

  const fileService = new FileServiceImpl()

  useEffect(() => {
    const loadSharedFile = async () => {
      setLoading(true)
      setError(null)

      try {
        const shared = await shareService.getSharedFile(shareId)

        if (!shared) {
          setError("This share link is invalid or has expired.")
          setLoading(false)
          return
        }

        setSharedFile(shared)

        // Check if password protected
        if (shared.password) {
          setIsPasswordProtected(true)
          setLoading(false)
          return
        }

        // If not password protected, load the file
        await loadFile(shared)

        // Record access
        await shareService.recordAccess(shareId)
      } catch (error) {
        console.error("Error loading shared file:", error)
        setError("Failed to load the shared file. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadSharedFile()
  }, [shareId])

  const loadFile = async (shared: SharedFile) => {
    try {
      const fileData = await fileService.getFileById(shared.fileId)

      if (!fileData) {
        setError("The shared file could not be found.")
        return
      }

      setFile(fileData)
    } catch (error) {
      console.error("Error loading file data:", error)
      setError("Failed to load the file data. Please try again.")
    }
  }

  const handleVerifyPassword = async () => {
    if (!sharedFile) return

    setLoading(true)

    try {
      const isValid = await shareService.validateSharePassword(shareId, password)

      if (isValid) {
        setIsPasswordVerified(true)
        await loadFile(sharedFile)
        await shareService.recordAccess(shareId)
      } else {
        setError("Incorrect password. Please try again.")
      }
    } catch (error) {
      console.error("Error verifying password:", error)
      setError("Failed to verify password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!file) return

    try {
      await fileService.downloadFile(file.id)
    } catch (error) {
      console.error("Error downloading file:", error)
      setError("Failed to download the file. Please try again.")
    }
  }

  const handleStartEditing = () => {
    if (!file || !file.content) return

    setEditedContent(file.content)
    setIsEditing(true)
  }

  const handleSaveEdits = async () => {
    if (!file) return

    setLoading(true)

    try {
      await fileService.updateFile(file.id, { content: editedContent })

      // Reload the file to get the updated content
      const updatedFile = await fileService.getFileById(file.id)
      if (updatedFile) {
        setFile(updatedFile)
      }

      setIsEditing(false)
    } catch (error) {
      console.error("Error saving edits:", error)
      setError("Failed to save your changes. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdits = () => {
    setIsEditing(false)
  }

  const getFileIcon = () => {
    if (!file) return <FileText className="h-6 w-6" />

    switch (file.type) {
      case "text":
        return <FileText className="h-6 w-6" />
      case "image":
        return <ImageIcon className="h-6 w-6 text-blue-500" />
      case "spreadsheet":
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />
      case "presentation":
        return <FileIcon className="h-6 w-6 text-orange-500" />
      case "code":
        return <Code className="h-6 w-6 text-purple-500" />
      case "pdf":
        return <FileIcon className="h-6 w-6 text-red-500" />
      case "video":
        return <FileIcon className="h-6 w-6 text-pink-500" />
      case "audio":
        return <FileIcon className="h-6 w-6 text-yellow-500" />
      case "markdown":
        return <FileText className="h-6 w-6 text-teal-500" />
      default:
        return <FileText className="h-6 w-6" />
    }
  }

  const renderFileContent = () => {
    if (!file) return null

    if (isEditing) {
      return (
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="min-h-[300px] font-mono"
        />
      )
    }

    if (file.type === "image" && file.url) {
      return (
        <div className="flex justify-center">
          <Image
            src={file.url || "/placeholder.svg"}
            alt={file.name}
            width={500}
            height={300}
            className="max-w-full object-contain"
          />
        </div>
      )
    }

    if (file.type === "video" && file.url) {
      return (
        <div className="flex justify-center">
          <video controls className="max-w-full">
            <source src={file.url} />
            Your browser does not support the video tag.
          </video>
        </div>
      )
    }

    if (file.type === "audio" && file.url) {
      return (
        <div className="flex justify-center">
          <audio controls className="w-full">
            <source src={file.url} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      )
    }

    if (file.type === "markdown" && file.content) {
      // Simple markdown rendering
      const html = file.content
        .replace(/^# (.*$)/gm, "<h1>$1</h1>")
        .replace(/^## (.*$)/gm, "<h2>$1</h2>")
        .replace(/^### (.*$)/gm, "<h3>$1</h3>")
        .replace(/\*\*(.*)\*\*/gm, "<strong>$1</strong>")
        .replace(/\*(.*)\*/gm, "<em>$1</em>")
        .replace(/\n/gm, "<br>")
        .replace(
          /- \[(x| )\] (.*$)/gm,
          (match, checked, text) =>
            `<div><input type="checkbox" ${checked === "x" ? "checked" : ""} disabled /> ${text}</div>`,
        )
        .replace(/- (.*$)/gm, "<li>$1</li>")

      return <div className="prose max-w-full" dangerouslySetInnerHTML={{ __html: html }} />
    }

    return <pre className={file.type === "code" ? "text-sm" : ""}>{file.content || "No content available"}</pre>
  }

  if (loading && !file) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Error
            </CardTitle>
            <CardDescription>There was a problem accessing this shared file</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (isPasswordProtected && !isPasswordVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Password Protected
            </CardTitle>
            <CardDescription>This file is password protected. Enter the password to view it.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleVerifyPassword()
                    }
                  }}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleVerifyPassword} className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Access File"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => router.push("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Home
        </Button>

        {file && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  {getFileIcon()}
                  <span className="ml-2">{file.name}</span>
                </div>

                <div className="flex space-x-2">
                  {sharedFile?.allowDownload && (
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}

                  {sharedFile?.allowEdit && !isEditing && (
                    <Button variant="outline" size="sm" onClick={handleStartEditing}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}

                  {isEditing && (
                    <>
                      <Button variant="outline" size="sm" onClick={handleSaveEdits} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>

                      <Button variant="outline" size="sm" onClick={handleCancelEdits}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>

              <CardDescription>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>Views: {sharedFile?.accessCount || 0}</span>
                  </div>

                  {sharedFile?.expiresAt && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Expires: {new Date(sharedFile.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Size: {file.size}</span>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className={`p-4 rounded-md ${file.type === "code" ? "bg-muted font-mono" : "bg-muted/20"}`}>
                {renderFileContent()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
