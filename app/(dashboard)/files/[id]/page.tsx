"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileMemoryPanel } from "@/components/file-memory-panel"

// Mock file data - replace with your actual data fetching logic
const getFileById = async (id: string) => {
  return {
    id,
    name: `File ${id}`,
    type: "document",
    size: "1.2 MB",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    content: "This is the file content.",
  }
}

export default function FileDetailPage() {
  const params = useParams()
  const [file, setFile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("details")

  const id = typeof params.id === "string" ? params.id : ""

  useEffect(() => {
    async function loadFile() {
      setIsLoading(true)
      try {
        const fileData = await getFileById(id)
        setFile(fileData)
      } catch (error) {
        console.error("Error loading file:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      loadFile()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">Loading file details...</p>
        </div>
      </div>
    )
  }

  if (!file) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">File not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">{file.name}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="memories">Memories</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>File Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p>{file.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Size</p>
                  <p>{file.size}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p>{new Date(file.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Updated</p>
                  <p>{new Date(file.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>File Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border p-4">
                <pre className="whitespace-pre-wrap">{file.content}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memories" className="mt-6">
          <FileMemoryPanel fileId={file.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
