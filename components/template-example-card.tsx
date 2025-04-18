"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { templateToShareableString, getTemplateFilename } from "@/lib/template-utils"

interface TemplateExampleCardProps {
  title: string
  description: string
  category: string
  color: string
  template: string
}

export function TemplateExampleCard({ title, description, category, color, template }: TemplateExampleCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(template)
    setCopied(true)
    toast({
      title: "Copied to clipboard",
      description: "The template has been copied to your clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const templateObj = {
      name: title,
      description,
      prompt_template: template,
      color,
      metadata: {
        category,
        created: new Date().toISOString(),
      },
    }

    // Create a blob from the template JSON
    const shareableString = templateToShareableString(templateObj)
    const blob = new Blob([shareableString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    // Create a temporary link and trigger download
    const a = document.createElement("a")
    a.href = url
    a.download = getTemplateFilename(templateObj)
    document.body.appendChild(a)
    a.click()

    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Template downloaded",
      description: `Successfully downloaded "${title}" template`,
    })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2" style={{ backgroundColor: `${color}20` }}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge style={{ backgroundColor: color, color: "white" }}>{category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="bg-muted p-3 rounded-md whitespace-pre-wrap font-mono text-sm max-h-60 overflow-y-auto">
          {template}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
          {copied ? "Copied" : "Copy Template"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </CardFooter>
    </Card>
  )
}
