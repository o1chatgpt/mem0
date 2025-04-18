"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"
import { Mem0Chat } from "@/components/mem0-chat"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BrainCircuit, Plus, Edit, Save, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"

type MemoryCategory = {
  id: number
  name: string
  description: string | null
  color: string | null
  icon: string | null
  user_id: number
  created_at: string
  prompt_template?: string | null
}

export default function MemoryPage() {
  const { user } = useUser()
  const [categories, setCategories] = useState<MemoryCategory[]>([])
  const [newCategory, setNewCategory] = useState<Partial<MemoryCategory>>({
    name: "",
    description: "",
    color: "#4f46e5",
    icon: "brain-circuit",
  })
  const [editingCategory, setEditingCategory] = useState<MemoryCategory | null>(null)
  const [editingPromptTemplate, setEditingPromptTemplate] = useState<{ id: number; template: string } | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchCategories()
    }
  }, [user])

  const fetchCategories = async () => {
    if (!user?.id) return

    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getCategories",
          userId: user.id,
        }),
      })

      const data = await response.json()
      if (data.categories) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "Failed to fetch memory categories",
        variant: "destructive",
      })
    }
  }

  const handleCreateCategory = async () => {
    if (!user?.id || !newCategory.name) return

    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createCategory",
          userId: user.id,
          category: {
            ...newCategory,
            user_id: user.id,
          },
        }),
      })

      const data = await response.json()
      if (data.category) {
        setCategories([...categories, data.category])
        setNewCategory({
          name: "",
          description: "",
          color: "#4f46e5",
          icon: "brain-circuit",
        })
        toast({
          title: "Success",
          description: "Memory category created successfully",
        })
      }
    } catch (error) {
      console.error("Error creating category:", error)
      toast({
        title: "Error",
        description: "Failed to create memory category",
        variant: "destructive",
      })
    }
  }

  const handleUpdatePromptTemplate = async () => {
    if (!user?.id || !editingPromptTemplate) return

    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateCategoryPromptTemplate",
          userId: user.id,
          categoryId: editingPromptTemplate.id,
          promptTemplate: editingPromptTemplate.template,
        }),
      })

      const data = await response.json()
      if (data.category) {
        setCategories(
          categories.map((cat) =>
            cat.id === data.category.id ? { ...cat, prompt_template: data.category.prompt_template } : cat,
          ),
        )
        setEditingPromptTemplate(null)
        toast({
          title: "Success",
          description: "Prompt template updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating prompt template:", error)
      toast({
        title: "Error",
        description: "Failed to update prompt template",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return <div className="p-4">Please log in to access memory features</div>
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <BrainCircuit className="mr-2" /> Memory Management
      </h1>

      <Tabs defaultValue="chat">
        <TabsList className="mb-4">
          <TabsTrigger value="chat">Chat with Memory</TabsTrigger>
          <TabsTrigger value="categories">Memory Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Mem0Chat userId={user.id} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Category</CardTitle>
                <CardDescription>Create a new memory category to organize your memories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="e.g., Work, Personal, Technical"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={newCategory.description || ""}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      placeholder="What kind of memories belong in this category?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="color"
                        type="color"
                        value={newCategory.color || "#4f46e5"}
                        onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={newCategory.color || "#4f46e5"}
                        onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateCategory} disabled={!newCategory.name} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Create Category
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Memory Categories</CardTitle>
                  <CardDescription>Manage your memory categories and prompt templates</CardDescription>
                </CardHeader>
                <CardContent>
                  {categories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No categories yet. Create your first one!</div>
                  ) : (
                    <div className="space-y-4">
                      {categories.map((category) => (
                        <div key={category.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: category.color || "#888888" }}
                              ></div>
                              <h3 className="font-medium text-lg">{category.name}</h3>
                            </div>
                            <Badge variant="outline">{new Date(category.created_at).toLocaleDateString()}</Badge>
                          </div>
                          {category.description && <p className="text-sm text-gray-600 mb-2">{category.description}</p>}

                          <Separator className="my-3" />

                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <Label className="text-sm font-medium">Prompt Template</Label>
                              {editingPromptTemplate?.id === category.id ? (
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleUpdatePromptTemplate}
                                    className="h-7 px-2"
                                  >
                                    <Save className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingPromptTemplate(null)}
                                    className="h-7 px-2"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setEditingPromptTemplate({
                                      id: category.id,
                                      template: category.prompt_template || "",
                                    })
                                  }
                                  className="h-7 px-2"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>

                            {editingPromptTemplate?.id === category.id ? (
                              <Textarea
                                value={editingPromptTemplate.template}
                                onChange={(e) =>
                                  setEditingPromptTemplate({
                                    ...editingPromptTemplate,
                                    template: e.target.value,
                                  })
                                }
                                placeholder="Enter a custom prompt template for this category..."
                                className="min-h-[100px]"
                              />
                            ) : (
                              <div className="text-sm bg-muted/50 p-2 rounded-md min-h-[40px]">
                                {category.prompt_template ? (
                                  category.prompt_template
                                ) : (
                                  <span className="text-gray-500 italic">
                                    No custom prompt template. Using default.
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
