"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Upload, BarChart } from "lucide-react"
import Link from "next/link"
import { MemoryCategoryManager } from "@/components/memory-category-manager"
import { CategoryPromptEditor } from "@/components/category-prompt-editor"
import { ImportTemplateDialog } from "@/components/import-template-dialog"
import type { MemoryCategory } from "@/lib/mem0"
import type { TemplateExport } from "@/lib/template-utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MemoryCategoriesPage() {
  // In a real app, this would come from authentication
  const userId = 1 // Using the admin user we created in the database
  const [categories, setCategories] = useState<MemoryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("manage")
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getCategories",
          userId,
        }),
      })

      const data = await response.json()
      if (data.categories) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImportTemplate = async (template: TemplateExport) => {
    // Check if a category with this name already exists
    const existingCategory = categories.find((c) => c.name === template.name)

    if (existingCategory) {
      // Update existing category with the imported template
      try {
        const response = await fetch("/api/mem0", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "updateCategoryPromptTemplate",
            categoryId: existingCategory.id,
            promptTemplate: template.prompt_template,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update category")
        }

        await fetchCategories()
        return
      } catch (error) {
        console.error("Error updating category:", error)
        throw error
      }
    } else {
      // Create a new category with the imported template
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

        await fetchCategories()
        return
      } catch (error) {
        console.error("Error creating category:", error)
        throw error
      }
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/mem0-integration">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mem0 Integration
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Memory Categories</h1>
        </div>
        <div className="flex space-x-2">
          <Link href="/template-analytics">
            <Button variant="outline">
              <BarChart className="mr-2 h-4 w-4" />
              Analytics Dashboard
            </Button>
          </Link>
          <Link href="/template-features">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Template System
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import Template
          </Button>
          <Link href="/memory-categories/templates">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Browse Template Examples
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="manage">Manage Categories</TabsTrigger>
          <TabsTrigger value="prompts">Category Prompts</TabsTrigger>
        </TabsList>
        <TabsContent value="manage" className="mt-4">
          <MemoryCategoryManager userId={userId} />
        </TabsContent>
        <TabsContent value="prompts" className="mt-4">
          {loading ? (
            <div className="text-center py-4">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No categories found. Create categories in the "Manage Categories" tab first.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">
                  Customize how the AI responds to different categories of memories by editing the prompt templates
                  below.
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setIsImportDialogOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                  </Button>
                  <Link href="/memory-categories/templates">
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Browse Examples
                    </Button>
                  </Link>
                </div>
              </div>
              {categories.map((category) => (
                <CategoryPromptEditor key={category.id} category={category} onUpdate={fetchCategories} />
              ))}
            </div>
          )}
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
