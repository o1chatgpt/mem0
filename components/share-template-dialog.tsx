"use client"

import { useState } from "react"
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
import { Copy, Download } from "lucide-react"
import type { MemoryCategory } from "@/lib/mem0"
import { categoryToTemplate, templateToShareableString, getTemplateFilename } from "@/lib/template-utils"

interface ShareTemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  category: MemoryCategory
}

export function ShareTemplateDialog({ isOpen, onClose, category }: ShareTemplateDialogProps) {
  const [copied, setCopied] = useState(false)

  // Convert category to shareable template
  const template = categoryToTemplate(category)
  const shareableString = templateToShareableString(template)

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableString)
    setCopied(true)
    toast({
      title: "Copied to clipboard",
      description: "The template has been copied to your clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    // Create a blob from the template JSON
    const blob = new Blob([shareableString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    // Create a temporary link and trigger download
    const a = document.createElement("a")
    a.href = url
    a.download = getTemplateFilename(template)
    document.body.appendChild(a)
    a.click()

    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Template downloaded",
      description: "The template has been downloaded as a JSON file",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Template</DialogTitle>
          <DialogDescription>
            Share this template with others by copying the JSON below or downloading it as a file.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            value={shareableString}
            readOnly
            className="font-mono text-sm h-60"
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
          <div className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{category.name}</span> template
            </div>
            <div className="text-sm text-muted-foreground">{shareableString.length} characters</div>
          </div>
        </div>
        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
