"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Upload, FileUp, AlertCircle } from "lucide-react"
import { parseShareableString } from "@/lib/template-utils"
import type { TemplateExport } from "@/lib/template-utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ImportTemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (template: TemplateExport) => Promise<void>
}

export function ImportTemplateDialog({ isOpen, onClose, onImport }: ImportTemplateDialogProps) {
  const [importText, setImportText] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importedTemplate, setImportedTemplate] = useState<TemplateExport | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setImportText(e.target.value)
    setError(null)
    setImportedTemplate(null)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setImportedTemplate(null)

    const file = e.target.files?.[0]
    if (!file) return

    // Check if it's a JSON file
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setError("Please upload a JSON file")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        setImportText(content)
        validateImport(content)
      } catch (err) {
        setError("Failed to read file")
      }
    }
    reader.readAsText(file)
  }

  const validateImport = (text: string) => {
    const result = parseShareableString(text)

    if (result.error) {
      setError(result.error)
      return false
    }

    setImportedTemplate(result.template!)
    return true
  }

  const handleImport = async () => {
    if (!importText.trim()) {
      setError("Please enter or upload template data")
      return
    }

    if (!importedTemplate && !validateImport(importText)) {
      return
    }

    setIsImporting(true)

    try {
      await onImport(importedTemplate!)
      toast({
        title: "Template imported",
        description: `Successfully imported "${importedTemplate!.name}" template`,
      })
      onClose()
    } catch (err) {
      setError("Failed to import template. Please try again.")
    } finally {
      setIsImporting(false)
    }
  }

  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Template</DialogTitle>
          <DialogDescription>
            Import a template by pasting its JSON data or uploading a template file.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-center mb-4">
            <Button variant="outline" onClick={handleClickUpload}>
              <FileUp className="mr-2 h-4 w-4" />
              Upload Template File
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="application/json"
              onChange={handleFileUpload}
            />
          </div>

          <div className="relative">
            <Textarea
              value={importText}
              onChange={handleTextChange}
              placeholder="Paste template JSON here..."
              className="font-mono text-sm h-60"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {importedTemplate && (
            <Alert>
              <AlertTitle>Template Preview</AlertTitle>
              <AlertDescription>
                <div className="space-y-1 mt-1">
                  <div>
                    <strong>Name:</strong> {importedTemplate.name}
                  </div>
                  {importedTemplate.description && (
                    <div>
                      <strong>Description:</strong> {importedTemplate.description}
                    </div>
                  )}
                  <div>
                    <strong>Template length:</strong> {importedTemplate.prompt_template.length} characters
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isImporting || (!importedTemplate && !importText.trim())}>
            <Upload className="mr-2 h-4 w-4" />
            {isImporting ? "Importing..." : "Import Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
