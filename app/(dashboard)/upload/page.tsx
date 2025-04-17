"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Upload, File, X } from "lucide-react"

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setTimeout(() => {
      toast({
        title: "Files uploaded",
        description: `Successfully uploaded ${files.length} file(s).`,
      })
      setFiles([])
      setIsUploading(false)
    }, 2000)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-2 text-3xl font-bold">Upload</h1>
      <p className="mb-8 text-lg text-muted-foreground">Upload files for your AI family members to process</p>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>Select files to upload</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="file-upload">File Type</Label>
              <Select defaultValue="document">
                <SelectTrigger>
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="ai-member">AI Family Member</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select AI family member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  <SelectItem value="kara">Kara</SelectItem>
                  <SelectItem value="lyra">Lyra</SelectItem>
                  <SelectItem value="sophia">Sophia</SelectItem>
                  <SelectItem value="stan">Stan</SelectItem>
                  <SelectItem value="dude">Dude</SelectItem>
                  <SelectItem value="karl">Karl</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="file-upload">Files</Label>
              <div className="flex items-center gap-2">
                <Input id="file-upload" type="file" multiple onChange={handleFileChange} className="hidden" />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Select Files
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleUpload} disabled={isUploading || files.length === 0} className="w-full">
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selected Files</CardTitle>
            <CardDescription>Files ready for upload</CardDescription>
          </CardHeader>
          <CardContent>
            {files.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">No files selected</p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border p-2">
                    <div className="flex items-center">
                      <File className="mr-2 h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(index)} className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
