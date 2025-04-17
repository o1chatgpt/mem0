"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeEditor } from "@/components/code-editor"
import { FilePreview } from "@/components/file-preview"
import { getFileContent, updateFileContent, getFileLanguage } from "@/actions/file-actions"
import { ArrowLeft, Save, Eye } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

export default function FileEditorPage({ params }: { params: { fileId: string } }) {
  const router = useRouter()
  const [file, setFile] = useState<any>(null)
  const [content, setContent] = useState("")
  const [originalContent, setOriginalContent] = useState("")
  const [language, setLanguage] = useState<"html" | "css" | "javascript" | "markdown" | "text">("text")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setLoading(true)
        const fileData = await getFileContent(Number(params.fileId))
        setFile(fileData)
        setContent(fileData.content || "")
        setOriginalContent(fileData.content || "")

        const fileLanguage = await getFileLanguage(fileData.mime_type, fileData.name)
        setLanguage(fileLanguage as any)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching file:", error)
        setLoading(false)
      }
    }

    fetchFile()
  }, [params.fileId])

  const handleSave = async () => {
    if (content === originalContent) {
      toast({
        title: "No changes to save",
        description: "The file content has not been modified.",
      })
      return
    }

    try {
      setSaving(true)
      await updateFileContent(Number(params.fileId), content)
      setOriginalContent(content)
      toast({
        title: "File saved",
        description: "Your changes have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving file:", error)
      toast({
        title: "Error saving file",
        description: "There was an error saving your changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = content !== originalContent

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-[600px] bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!file) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-2">File Not Found</h2>
            <p>The requested file could not be found.</p>
            <Link href="/">
              <Button className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{file.name}</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setActiveTab(activeTab === "edit" ? "preview" : "edit")}>
            {activeTab === "edit" ? (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Edit
              </>
            )}
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {file.name} <span className="text-sm text-muted-foreground ml-2">{file.mime_type}</span>
            </span>
            {hasChanges && <span className="text-sm text-yellow-500">Unsaved changes</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "edit" | "preview")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="p-0 pt-4">
              <CodeEditor value={content} onChange={setContent} language={language} />
            </TabsContent>
            <TabsContent value="preview" className="p-0 pt-4">
              <FilePreview content={content} fileType={language} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
