"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Edit, Save, RotateCcw, Share2 } from "lucide-react"
import type { MemoryCategory } from "@/lib/mem0"
import { ShareTemplateDialog } from "@/components/share-template-dialog"

interface CategoryPromptEditorProps {
  category: MemoryCategory
  onUpdate: () => void
}

export function CategoryPromptEditor({ category, onUpdate }: CategoryPromptEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [promptTemplate, setPromptTemplate] = useState(category.prompt_template || "")
  const [originalPrompt, setOriginalPrompt] = useState(category.prompt_template || "")
  const [isSaving, setIsSaving] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

  useEffect(() => {
    setPromptTemplate(category.prompt_template || "")
    setOriginalPrompt(category.prompt_template || "")
  }, [category])

  const handleSave = async () => {
    if (promptTemplate === originalPrompt) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateCategoryPromptTemplate",
          categoryId: category.id,
          promptTemplate: promptTemplate.trim() || null,
        }),
      })

      const data = await response.json()
      if (data.category) {
        setOriginalPrompt(data.category.prompt_template || "")
        toast({
          title: "Success",
          description: "Prompt template updated successfully",
        })
        onUpdate()
      }
    } catch (error) {
      console.error("Error updating prompt template:", error)
      toast({
        title: "Error",
        description: "Failed to update prompt template",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setIsEditing(false)
    }
  }

  const handleReset = () => {
    setPromptTemplate(originalPrompt)
    setIsEditing(false)
  }

  const handleShare = () => {
    setIsShareDialogOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: category.color || "#888888" }}></div>
              {category.name} Prompt Template
            </div>
          </CardTitle>
          <div className="flex space-x-2">
            {!isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              placeholder="Enter a custom prompt template for this category..."
              className="min-h-[200px] font-mono text-sm"
            />
          ) : (
            <div className="p-3 bg-muted rounded-md whitespace-pre-wrap font-mono text-sm">
              {promptTemplate || "No custom prompt template set for this category."}
            </div>
          )}
          {isEditing && (
            <div className="mt-2 text-sm text-muted-foreground">
              <p>
                This prompt template will be used when generating responses for memories in the {category.name}{" "}
                category. The template should describe how the AI should respond to queries in this category.
              </p>
              <p className="mt-1">Leave blank to use the default template for this category.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ShareTemplateDialog isOpen={isShareDialogOpen} onClose={() => setIsShareDialogOpen(false)} category={category} />
    </>
  )
}
