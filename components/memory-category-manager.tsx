"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Plus, Edit, Trash2, RefreshCw, Tag, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { DEFAULT_MEMORY_CATEGORIES } from "@/lib/mem0"

type MemoryCategory = {
  id: number
  name: string
  description: string | null
  color: string | null
  icon: string | null
  user_id: number
  created_at: string
}

export function MemoryCategoryManager({ userId }: { userId: number }) {
  const [categories, setCategories] = useState<MemoryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#4CAF50",
    icon: "tag",
  })
  const [editingCategory, setEditingCategory] = useState<MemoryCategory | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getCategories",
          userId,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch categories: ${errorText}`)
      }

      const data = await response.json()
      if (data.categories) {
        setCategories(data.categories)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setError("Failed to load categories. Please try again.")
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    try {
      if (!newCategory.name.trim()) {
        toast({
          title: "Error",
          description: "Category name is required",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createCategory",
          userId,
          category: {
            ...newCategory,
            user_id: userId,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create category")
      }

      const data = await response.json()
      setCategories([...categories, data.category])
      setNewCategory({
        name: "",
        description: "",
        color: "#4CAF50",
        icon: "tag",
      })
      setIsCreateDialogOpen(false)
      toast({
        title: "Success",
        description: "Category created successfully",
      })
    } catch (error) {
      console.error("Error creating category:", error)
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateCategory = async () => {
    try {
      if (!editingCategory) return
      if (!editingCategory.name.trim()) {
        toast({
          title: "Error",
          description: "Category name is required",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateCategory",
          userId,
          categoryId: editingCategory.id,
          category: {
            name: editingCategory.name,
            description: editingCategory.description,
            color: editingCategory.color,
            icon: editingCategory.icon,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update category")
      }

      const data = await response.json()
      setCategories(categories.map((cat) => (cat.id === editingCategory.id ? data.category : cat)))
      setEditingCategory(null)
      setIsEditDialogOpen(false)
      toast({
        title: "Success",
        description: "Category updated successfully",
      })
    } catch (error) {
      console.error("Error updating category:", error)
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async () => {
    try {
      if (!categoryToDelete) return

      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteCategory",
          userId,
          categoryId: categoryToDelete,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete category")
      }

      setCategories(categories.filter((cat) => cat.id !== categoryToDelete))
      setCategoryToDelete(null)
      setIsDeleteDialogOpen(false)
      toast({
        title: "Success",
        description: "Category deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleResetCategories = async () => {
    try {
      // First delete all existing categories
      const deleteResponse = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteAllCategories",
          userId,
        }),
      })

      if (!deleteResponse.ok) {
        throw new Error("Failed to reset categories")
      }

      // Then ensure default categories are created
      const createResponse = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ensureDefaultCategories",
          userId,
        }),
      })

      if (!createResponse.ok) {
        throw new Error("Failed to create default categories")
      }

      // Fetch the new categories
      await fetchCategories()
      setIsResetDialogOpen(false)
      toast({
        title: "Success",
        description: "Categories have been reset to defaults",
      })
    } catch (error) {
      console.error("Error resetting categories:", error)
      toast({
        title: "Error",
        description: "Failed to reset categories. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredCategories =
    activeTab === "all"
      ? categories
      : categories.filter((cat) => {
          const defaultCategoryNames = DEFAULT_MEMORY_CATEGORIES.map((c) => c.name)
          return activeTab === "default"
            ? defaultCategoryNames.includes(cat.name)
            : !defaultCategoryNames.includes(cat.name)
        })

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Categories</TabsTrigger>
            <TabsTrigger value="default">Default</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
          <div className="space-x-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Category</DialogTitle>
                  <DialogDescription>Add a new category to organize your memories</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="Category name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      placeholder="Category description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="color"
                        type="color"
                        value={newCategory.color}
                        onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={newCategory.color}
                        onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon</Label>
                    <Input
                      id="icon"
                      value={newCategory.icon}
                      onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                      placeholder="Icon name (e.g., tag, file, star)"
                    />
                    <p className="text-sm text-muted-foreground">
                      Use icon names from Lucide Icons (e.g., tag, file, star)
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCategory}>Create Category</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <Button variant="outline" onClick={() => setIsResetDialogOpen(true)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset to Defaults
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Categories</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all your custom categories and restore the default ones. Any memories assigned to
                    custom categories will be uncategorized. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetCategories}>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-4" />
              <p className="text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchCategories}>
                Try Again
              </Button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Tag className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No categories found</p>
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                Create Your First Category
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="overflow-hidden">
                  <div className="h-2" style={{ backgroundColor: category.color || "#888888" }}></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <div
                        className="w-6 h-6 rounded-full mr-2 flex items-center justify-center text-white"
                        style={{ backgroundColor: category.color || "#888888" }}
                      >
                        {category.icon ? (
                          <span className="text-xs">{category.icon.charAt(0).toUpperCase()}</span>
                        ) : (
                          <Tag className="h-3 w-3" />
                        )}
                      </div>
                      {category.name}
                    </CardTitle>
                    <CardDescription>{category.description || "No description provided"}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <div className="flex justify-between w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setCategoryToDelete(category.id)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="default" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Tag className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No default categories found</p>
              <Button className="mt-4" onClick={handleResetCategories}>
                Restore Default Categories
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="overflow-hidden">
                  <div className="h-2" style={{ backgroundColor: category.color || "#888888" }}></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <div
                        className="w-6 h-6 rounded-full mr-2 flex items-center justify-center text-white"
                        style={{ backgroundColor: category.color || "#888888" }}
                      >
                        {category.icon ? (
                          <span className="text-xs">{category.icon.charAt(0).toUpperCase()}</span>
                        ) : (
                          <Tag className="h-3 w-3" />
                        )}
                      </div>
                      {category.name}
                    </CardTitle>
                    <CardDescription>{category.description || "No description provided"}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <div className="flex justify-between w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setCategoryToDelete(category.id)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Tag className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No custom categories found</p>
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                Create Your First Custom Category
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="overflow-hidden">
                  <div className="h-2" style={{ backgroundColor: category.color || "#888888" }}></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <div
                        className="w-6 h-6 rounded-full mr-2 flex items-center justify-center text-white"
                        style={{ backgroundColor: category.color || "#888888" }}
                      >
                        {category.icon ? (
                          <span className="text-xs">{category.icon.charAt(0).toUpperCase()}</span>
                        ) : (
                          <Tag className="h-3 w-3" />
                        )}
                      </div>
                      {category.name}
                    </CardTitle>
                    <CardDescription>{category.description || "No description provided"}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <div className="flex justify-between w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setCategoryToDelete(category.id)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category details</DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="Category name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingCategory.description || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="Category description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="edit-color"
                    type="color"
                    value={editingCategory.color || "#888888"}
                    onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={editingCategory.color || "#888888"}
                    onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-icon">Icon</Label>
                <Input
                  id="edit-icon"
                  value={editingCategory.icon || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                  placeholder="Icon name (e.g., tag, file, star)"
                />
                <p className="text-sm text-muted-foreground">
                  Use icon names from Lucide Icons (e.g., tag, file, star)
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Category"
        description="Are you sure you want to delete this category? All memories assigned to this category will be uncategorized. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteCategory}
        variant="destructive"
      />
    </div>
  )
}
