"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import { PromptTemplateExamples } from "@/components/prompt-template-examples"
import { TemplateLibrary } from "@/components/template-library"
import { ImportTemplateDialog } from "@/components/import-template-dialog"
import { useState } from "react"
import type { TemplateExport } from "@/lib/template-utils"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PromptTemplatesPage() {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const userId = 1 // In a real app, this would come from authentication

  const handleImportTemplate = async (template: TemplateExport) => {
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createCategory",
          userId,
          category: {
            name: template.name,
            description: template.description || null,
            color: template.color || null,
            icon: template.icon || null,
            prompt_template: template.prompt_template,
            user_id: userId,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create category")
      }

      toast({
        title: "Template imported",
        description: `Successfully imported "${template.name}" template as a new category`,
      })

      return
    } catch (error) {
      console.error("Error creating category:", error)
      throw error
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/memory-categories">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Memory Categories
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Prompt Templates</h1>
        </div>
        <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Import Template
        </Button>
      </div>

      <Tabs defaultValue="examples">
        <TabsList>
          <TabsTrigger value="examples">Example Templates</TabsTrigger>
          <TabsTrigger value="community">Community Library</TabsTrigger>
        </TabsList>
        <TabsContent value="examples" className="mt-4">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Browse and use these example templates to customize how your AI assistant responds to different types of
              queries. Copy a template you like and paste it into the prompt template editor for a category.
            </p>

            <PromptTemplateExamples />

            <div className="bg-muted p-4 rounded-md mt-6">
              <h3 className="font-medium mb-2">Tips for Writing Effective Prompt Templates</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Start with a clear role definition for the AI</li>
                <li>Specify the focus areas and priorities</li>
                <li>Include specific instructions for how to respond to different query types</li>
                <li>Mention how to use memories and past interactions</li>
                <li>Keep templates concise but specific (3-10 paragraphs is ideal)</li>
                <li>Test and refine templates based on the responses you receive</li>
              </ul>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="community" className="mt-4">
          <TemplateLibrary />
        </TabsContent>
      </Tabs>

      <ImportTemplateDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportTemplate}
      />
    </div>
  )
}
