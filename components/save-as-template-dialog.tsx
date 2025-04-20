"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { addCustomTemplate, getFileTypeFromExtension } from "@/lib/templates-service"
import { FileText, Code, FileJson, FileType } from "lucide-react"

interface SaveAsTemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  fileName: string
  fileContent: string
}

export function SaveAsTemplateDialog({ isOpen, onClose, fileName, fileContent }: SaveAsTemplateDialogProps) {
  const { toast } = useToast()
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get file extension and type
  const extension = fileName.split(".").pop()?.toLowerCase() || ""
  const fileType = getFileTypeFromExtension(extension)

  const handleSave = async () => {
    if (!templateName.trim() || !templateDescription.trim()) return

    setIsSubmitting(true)

    try {
      // Add the template
      addCustomTemplate({
        name: templateName.trim(),
        description: templateDescription.trim(),
        fileType,
        extension,
        content: fileContent,
      })

      // Show success message
      toast({
        title: "Template saved",
        description: "Your template has been saved successfully.",
      })

      // Close the dialog and reset form
      onClose()
      setTemplateName("")
      setTemplateDescription("")
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error saving template",
        description: "There was a problem saving your template.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFileIcon = () => {
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-md">
            {getFileIcon()}
            <div>
              <p className="text-sm font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground">File Type: {fileType}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter a name for your template"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Describe what this template is for"
              rows={3}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            <p>This template will be saved to your browser's local storage and will be available for future use.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting || !templateName.trim() || !templateDescription.trim()}>
            {isSubmitting ? "Saving..." : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
