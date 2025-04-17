"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, FileText, RefreshCw, Tag, Plus, AlertCircle, Trash2, FileSymlink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { useSmartMemory } from "@/hooks/use-smart-memory"

export function FileAnalyzer() {
  const { selectedFile, selectedFileId, fileContent } = useAppContext()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [newNote, setNewNote] = useState("")
  const [activeTab, setActiveTab] = useState("analysis")

  // Use our new smart memory hook
  const {
    fileMemory,
    isLoading: isMemoryLoading,
    addTag,
    removeTag,
    addNote,
    storeAnalysisResults,
    findRelatedFiles,
    recordInteraction,
  } = useSmartMemory(selectedFileId, selectedFile)

  const [relatedFileIds, setRelatedFileIds] = useState<string[]>([])

  // Load related files when file memory changes
  useEffect(() => {
    const loadRelatedFiles = async () => {
      if (selectedFileId) {
        const relatedIds = await findRelatedFiles(5)
        setRelatedFileIds(relatedIds)
      }
    }

    loadRelatedFiles()
  }, [selectedFileId, findRelatedFiles, fileMemory])

  const handleAnalyzeFile = async () => {
    if (!selectedFile || !selectedFileId) return

    setIsAnalyzing(true)
    try {
      // In a real implementation, this would call an AI service like OpenAI or Grok
      // For now, we'll simulate an analysis based on the file type and content
      await new Promise((resolve) => setTimeout(resolve, 1500))

      let analysisText = ""
      let summaryText = ""
      let keywords: string[] = []
      const sentiment = "neutral"

      // Generate a simple analysis based on file type
      switch (selectedFile.type) {
        case "text":
        case "markdown":
          const wordCount = fileContent.split(/\s+/).filter(Boolean).length
          const lineCount = fileContent.split("\n").length
          analysisText = `This is a ${selectedFile.type} file with ${wordCount} words and ${lineCount} lines. `

          if (wordCount > 0) {
            const avgWordLength = fileContent.replace(/\s+/g, "").length / wordCount
            analysisText += `The average word length is ${avgWordLength.toFixed(1)} characters. `
          }

          // Extract some keywords
          const words = fileContent
            .toLowerCase()
            .split(/\W+/)
            .filter((w) => w.length > 4)
          const wordFreq: Record<string, number> = {}
          words.forEach((word) => {
            wordFreq[word] = (wordFreq[word] || 0) + 1
          })

          keywords = Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word)

          // Simple summary
          summaryText = `This ${selectedFile.type} file contains text content with ${wordCount} words.`
          break

        case "code":
        case "json":
        case "xml":
        case "yaml":
        case "css":
        case "html":
          const codeLines = fileContent.split("\n").length
          const commentCount = (fileContent.match(/\/\/|\/\*|\*\/|#|<!--/g) || []).length
          analysisText = `This is a ${selectedFile.type} file with ${codeLines} lines of code. `

          if (commentCount > 0) {
            analysisText += `It contains approximately ${commentCount} comments or comment markers. `
          }

          // Extract some keywords from code
          const codeWords = fileContent.split(/[^a-zA-Z0-9_]/).filter((w) => w.length > 4)
          const codeWordFreq: Record<string, number> = {}
          codeWords.forEach((word) => {
            codeWordFreq[word] = (codeWordFreq[word] || 0) + 1
          })

          keywords = Object.entries(codeWordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word)

          // Simple summary
          summaryText = `This ${selectedFile.type} file contains code with ${codeLines} lines.`
          break

        case "image":
          analysisText = `This is an image file of type ${selectedFile.type}. `
          analysisText += `The file size is ${selectedFile.size}. `

          // Simple summary
          summaryText = `This is an image file with size ${selectedFile.size}.`
          keywords = ["image", selectedFile.type, "visual", "media", "file"]
          break

        default:
          analysisText = `This is a ${selectedFile.type} file with size ${selectedFile.size}. `
          analysisText += `Further analysis would require specific processing for this file type.`

          // Simple summary
          summaryText = `This is a ${selectedFile.type} file with size ${selectedFile.size}.`
          keywords = [selectedFile.type, "file", "document"]
      }

      // Add a note about AI integration
      analysisText += `\n\nNote: In a production environment, this analysis would be performed by an AI model like Grok, providing deeper insights into the file content.`

      // Store analysis results using our smart memory service
      await storeAnalysisResults({
        summary: summaryText,
        insights: analysisText,
        keywords,
        sentiment,
        lastAnalyzed: new Date().toISOString(),
      })

      // Record this interaction
      await recordInteraction("analyze", "Completed file analysis")
    } catch (error) {
      console.error("Error analyzing file:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAddTag = async () => {
    if (!newTag.trim()) return

    try {
      await addTag(newTag.trim())
      setNewTag("")
    } catch (error) {
      console.error("Error adding tag:", error)
    }
  }

  const handleRemoveTag = async (tag: string) => {
    try {
      await removeTag(tag)
    } catch (error) {
      console.error("Error removing tag:", error)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      await addNote(newNote.trim())
      setNewNote("")
    } catch (error) {
      console.error("Error adding note:", error)
    }
  }

  if (!selectedFile) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Select a file to analyze</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Brain className="h-5 w-5 mr-2 text-primary" />
          Smart File Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-4 pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            <span className="font-medium">{selectedFile.name}</span>
          </div>
          <Button size="sm" onClick={handleAnalyzeFile} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100%-40px)]">
          <TabsList className="mb-2">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="related">Related</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="h-[calc(100%-40px)] overflow-auto">
            {isMemoryLoading ? (
              <div className="flex justify-center items-center h-full">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : fileMemory?.analysisResults?.insights ? (
              <div className="whitespace-pre-wrap text-sm">{fileMemory.analysisResults.insights}</div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Click the "Analyze" button to generate an analysis of this file.</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="summary" className="h-[calc(100%-40px)] overflow-auto">
            {isMemoryLoading ? (
              <div className="flex justify-center items-center h-full">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : fileMemory?.analysisResults?.summary ? (
              <div className="text-sm">{fileMemory.analysisResults.summary}</div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Click the "Analyze" button to generate a summary of this file.</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="tags" className="h-[calc(100%-40px)] overflow-auto">
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <Tag className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">File Tags</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {isMemoryLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : fileMemory?.tags && fileMemory.tags.length > 0 ? (
                  fileMemory.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No tags yet</div>
                )}
              </div>

              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddTag()
                    }
                  }}
                />
                <Button size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="h-[calc(100%-40px)] overflow-auto">
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <FileText className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">File Notes</span>
              </div>

              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {isMemoryLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : fileMemory?.notes && fileMemory.notes.length > 0 ? (
                  fileMemory.notes.map((note, index) => (
                    <div key={index} className="p-2 bg-muted rounded-md text-sm">
                      {note}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No notes yet</div>
                )}
              </div>

              <div className="space-y-2">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this file..."
                  className="text-sm"
                  rows={3}
                />
                <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="related" className="h-[calc(100%-40px)] overflow-auto">
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <FileSymlink className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Related Files</span>
              </div>

              <div className="space-y-2">
                {isMemoryLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : relatedFileIds.length > 0 ? (
                  relatedFileIds.map((fileId, index) => (
                    <div key={index} className="p-2 bg-muted rounded-md text-sm flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{fileId}</span>
                    </div>
                  ))
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No related files found. Add tags to help find connections between files.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
