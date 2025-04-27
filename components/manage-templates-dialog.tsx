"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  getCustomTemplates,
  deleteCustomTemplate,
  updateCustomTemplate,
  exportTemplates,
  importTemplates,
  type FileTemplate,
} from "@/lib/templates-service"
import {
  FileText,
  Code,
  FileJson,
  FileType,
  Trash,
  Edit,
  Check,
  X,
  Calendar,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

interface ManageTemplatesDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ManageTemplatesDialog({ isOpen, onClose }: ManageTemplatesDialogProps) {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<FileTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    imported: number
    skipped: number
    error?: string
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load templates when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  const loadTemplates = () => {
    const customTemplates = getCustomTemplates()
    setTemplates(customTemplates)
    setSelectedTemplates([])
  }

  // Filter templates based on search and active tab
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab = activeTab === "all" || template.fileType === activeTab

    return matchesSearch && matchesTab
  })

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      const success = deleteCustomTemplate(id)

      if (success) {
        toast({
          title: "Template deleted",
          description: "The template has been deleted successfully.",
        })
        loadTemplates()
      } else {
        toast({
          title: "Error deleting template",
          description: "There was a problem deleting the template.",
          variant: "destructive",
        })
      }
    }
  }

  const startEditing = (template: FileTemplate) => {
    setEditingTemplate(template.id)
    setEditName(template.name)
    setEditDescription(template.description)
  }

  const cancelEditing = () => {
    setEditingTemplate(null)
    setEditName("")
    setEditDescription("")
  }

  const saveEditing = (id: string) => {
    if (!editName.trim() || !editDescription.trim()) return

    const updated = updateCustomTemplate(id, {
      name: editName.trim(),
      description: editDescription.trim(),
    })

    if (updated) {
      toast({
        title: "Template updated",
        description: "The template has been updated successfully.",
      })
      loadTemplates()
      cancelEditing()
    } else {
      toast({
        title: "Error updating template",
        description: "There was a problem updating the template.",
        variant: "destructive",
      })
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch (e) {
      return "Unknown date"
    }
  }

  const toggleTemplateSelection = (id: string) => {
    setSelectedTemplates((prev) => {
      if (prev.includes(id)) {
        return prev.filter((templateId) => templateId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const toggleSelectAll = () => {
    if (selectedTemplates.length === filteredTemplates.length) {
      // Deselect all
      setSelectedTemplates([])
    } else {
      // Select all filtered templates
      setSelectedTemplates(filteredTemplates.map((t) => t.id))
    }
  }

  const handleExport = () => {
    try {
      // Export selected templates or all if none selected
      const templateIds = selectedTemplates.length > 0 ? selectedTemplates : undefined
      const exportData = exportTemplates(templateIds)

      // Create a blob and download it
      const blob = new Blob([exportData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `templates-export-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Close the export dialog
      setIsExportDialogOpen(false)

      // Show success toast
      toast({
        title: "Templates exported",
        description: `Successfully exported ${templateIds ? templateIds.length : templates.length} templates.`,
      })
    } catch (error) {
      console.error("Error exporting templates:", error)
      toast({
        title: "Export failed",
        description: "There was a problem exporting the templates.",
        variant: "destructive",
      })
    }
  }

  const handleImportClick = () => {
    // Reset import result
    setImportResult(null)
    // Open file picker
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Read the file
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        if (!content) throw new Error("Failed to read file")

        // Import the templates
        const result = importTemplates(content)
        setImportResult(result)

        // Reload templates if import was successful
        if (result.success && result.imported > 0) {
          loadTemplates()
        }
      } catch (error) {
        console.error("Error reading import file:", error)
        setImportResult({
          success: false,
          imported: 0,
          skipped: 0,
          error: "Failed to read the import file",
        })
      }
    }

    reader.readAsText(file)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Custom Templates</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="mb-4 flex justify-between items-center">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExportDialogOpen(true)}
                disabled={templates.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
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
              {filteredTemplates.length > 0 && (
                <div className="mb-2 flex items-center">
                  <Checkbox
                    id="select-all"
                    checked={selectedTemplates.length > 0 && selectedTemplates.length === filteredTemplates.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <label htmlFor="select-all" className="ml-2 text-sm">
                    {selectedTemplates.length > 0
                      ? `${selectedTemplates.length} template${selectedTemplates.length === 1 ? "" : "s"} selected`
                      : "Select all"}
                  </label>
                </div>
              )}

              <ScrollArea className="h-[350px] pr-4">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery
                      ? "No templates match your search"
                      : "No custom templates found. Create a template by saving a file as a template."}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={selectedTemplates.includes(template.id) ? "border-primary" : ""}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Checkbox
                                checked={selectedTemplates.includes(template.id)}
                                onCheckedChange={() => toggleTemplateSelection(template.id)}
                                className="mr-2"
                              />
                              {getTemplateIcon(template.fileType)}
                              {editingTemplate === template.id ? (
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="ml-2 w-[250px]"
                                  autoFocus
                                />
                              ) : (
                                <CardTitle className="ml-2 text-base">{template.name}</CardTitle>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-xs px-2 py-1 rounded-full bg-muted">{template.fileType}</div>
                              {editingTemplate === template.id ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => saveEditing(template.id)}
                                    disabled={!editName.trim() || !editDescription.trim()}
                                  >
                                    <Check className="h-4 w-4 text-green-500" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={cancelEditing}>
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button variant="ghost" size="icon" onClick={() => startEditing(template)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)}>
                                    <Trash className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          {editingTemplate === template.id ? (
                            <Textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="mt-2"
                              rows={2}
                            />
                          ) : (
                            <CardDescription className="text-xs mt-1">{template.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="text-xs bg-muted p-2 rounded font-mono h-[60px] overflow-hidden">
                            {template.content.slice(0, 150)}
                            {template.content.length > 150 && "..."}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0 flex justify-between">
                          <div className="text-xs text-muted-foreground">
                            Extension: <span className="font-mono">.{template.extension}</span>
                          </div>
                          {template.createdAt && (
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(template.createdAt)}
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>

      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
        onClick={(e) => {
          // Reset the value to allow selecting the same file again
          ;(e.target as HTMLInputElement).value = ""
        }}
      />

      {/* Export Dialog */}
      <AlertDialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export Templates</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedTemplates.length > 0
                ? `You are about to export ${selectedTemplates.length} selected template${selectedTemplates.length === 1 ? "" : "s"}.`
                : `You are about to export all ${templates.length} custom template${templates.length === 1 ? "" : "s"}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="text-sm">
              The templates will be exported as a JSON file that you can share with others or import on another device.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Dialog */}
      <AlertDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Templates</AlertDialogTitle>
            <AlertDialogDescription>
              Import templates from a JSON file that was previously exported.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            {importResult ? (
              <Alert className={importResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                {importResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription className={importResult.success ? "text-green-700" : "text-red-700"}>
                  {importResult.success
                    ? `Successfully imported ${importResult.imported} template${importResult.imported === 1 ? "" : "s"}.${
                        importResult.skipped > 0
                          ? ` Skipped ${importResult.skipped} invalid template${importResult.skipped === 1 ? "" : "s"}.`
                          : ""
                      }`
                    : importResult.error || "Failed to import templates."}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="text-center p-6 border-2 border-dashed rounded-md">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm mb-4">Select a template JSON file to import</p>
                <Button onClick={handleImportClick}>Select File</Button>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            {!importResult && (
              <AlertDialogAction onClick={handleImportClick}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
