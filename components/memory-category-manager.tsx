"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Plus, Edit, Trash, Tag } from "lucide-react"
import type { MemoryCategory } from "@/lib/mem0"

interface MemoryCategoryManagerProps {
  userId: number
}

export function MemoryCategoryManager({ userId }: MemoryCategoryManagerProps) {
  const [categories, setCategories] = useState<MemoryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#3b82f6", // Default blue
    icon: "tag",
  })
  const [isCreating, setIsCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getCategories",
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.categories) {
        setCategories(data.categories)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([]) // Set empty array on error
      toast({
        title: "Error",
        description: "Failed to load memory categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createCategory",
          userId,
          category: {
            name: newCategory.name,
            description: newCategory.description || null,
            color: newCategory.color || null,
            icon: newCategory.icon || null,
            user_id: userId,
          },
        }),
      })

      const data = await response.json()
      if (data.category) {
        setCategories([...categories, data.category])
        setNewCategory({
          name: "",
          description: "",
          color: "#3b82f6",
          icon: "tag",
        })
        setShowForm(false)
        toast({
          title: "Success",
          description: "Category created successfully",
        })
      }
    } catch (error) {
      console.error("Error creating category:", error)
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const getColorStyle = (color: string | null) => {
    return {
      backgroundColor: color || "#3b82f6",
      color: "white",
    }
  }

  const getCategoryIcon = (iconName: string | null) => {
    switch (iconName) {
      case "file":
        return <Tag className="h-4 w-4" />
      default:
        return <Tag className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Memory Categories</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Category
        </Button>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="mb-6 p-4 border rounded-md">
            <h3 className="text-lg font-medium mb-4">Create New Category</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Name</Label>
                <Input
                  id="category-name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Category name"
                />
              </div>
              <div>
                <Label htmlFor="category-description">Description</Label>
                <Textarea
                  id="category-description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Category description"
                />
              </div>
              <div>
                <Label htmlFor="category-color">Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="category-color"
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: newCategory.color }}></div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCategory} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Category"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No categories found. Create your first category to organize your memories.
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={getColorStyle(category.color)}
                  >
                    {getCategoryIcon(category.icon)}
                  </div>
                  <div>
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-xs text-muted-foreground">{category.description}</div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
