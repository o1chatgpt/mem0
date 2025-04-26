"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type FileTemplate, getAllTemplates, getTemplatesByType } from "@/lib/templates-service"
import { FileText, Code, FileJson, FileType } from "lucide-react"

interface TemplateSelectorDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: FileTemplate, fileName: string) => void
  onManageTemplates: () => void
}

export function TemplateSelectorDialog({
  isOpen,
  onClose,
  onSelectTemplate,
  onManageTemplates,
}: TemplateSelectorDialogProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [templates, setTemplates] = useState<FileTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<FileTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<FileTemplate | null>(null)
  const [fileName, setFileName] = useState("")

  // Load templates
  useEffect(() => {
    if (isOpen) {
      const allTemplates = getAllTemplates()
      setTemplates(allTemplates)
      setFilteredTemplates(allTemplates)
    }
  }, [isOpen])

  // Filter templates when tab or search changes
  useEffect(() => {
    let filtered = templates

    // Filter by type if not "all"
    if (activeTab !== "all") {
      filtered = getTemplatesByType(activeTab)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.fileType.toLowerCase().includes(query),
      )
    }

    setFilteredTemplates(filtered)
  }, [activeTab, searchQuery, templates])

  // Update filename when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setFileName(`new-file.${selectedTemplate.extension}`)
    } else {
      setFileName("")
    }
  }, [selectedTemplate])

  const handleSelectTemplate = (template: FileTemplate) => {
    setSelectedTemplate(template)
  }

  const handleCreate = () => {
    if (selectedTemplate && fileName) {
      onSelectTemplate(selectedTemplate, fileName)
    }
  }

  const getTemplateIcon = (fileType: string) => {
    switch (fileType) {
      case "html":
        return <Code className="h-6 w-6 text-orange-500" />
      case "css":
        return <Code className="h-6 w-6 text-blue-500" />
      case "javascript":
        return <Code className="h-6 w-6 text-yellow-500" />
      case "jsx":
      case "tsx":
        return <Code className="h-6 w-6 text-cyan-500" />
      case "markdown":
        return <FileText className="h-6 w-6 text-purple-500" />
      case "json":
        return <FileJson className="h-6 w-6 text-green-500" />
      default:
        return <FileType className="h-6 w-6 text-gray-500" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New File from Template</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="mb-4">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="css">CSS</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="jsx">React</TabsTrigger>
              <TabsTrigger value="markdown">Markdown</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <ScrollArea className="h-[350px] pr-4">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No templates found</div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {filteredTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-colors ${
                          selectedTemplate?.id === template.id ? "border-primary" : ""
                        }`}
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {getTemplateIcon(template.fileType)}
                              <CardTitle className="ml-2 text-base">{template.name}</CardTitle>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-xs px-2 py-1 rounded-full bg-muted">{template.fileType}</div>
                              {template.isCustom && (
                                <Badge variant="outline" className="bg-primary/10">
                                  Custom
                                </Badge>
                              )}
                            </div>
                          </div>
                          <CardDescription className="text-xs mt-1">{template.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="text-xs bg-muted p-2 rounded font-mono h-[60px] overflow-hidden">
                            {template.content.slice(0, 150)}
                            {template.content.length > 150 && "..."}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <div className="text-xs text-muted-foreground">
                            Extension: <span className="font-mono">.{template.extension}</span>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="mb-4">
            <Label htmlFor="fileName">File Name</Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              disabled={!selectedTemplate}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onManageTemplates}>
            Manage Templates
          </Button>
          <div>
            <Button variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!selectedTemplate || !fileName}>
              Create File
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
