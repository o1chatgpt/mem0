"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import type { MemoryCategory } from "@/lib/mem0"

interface CategorySelectorProps {
  userId: number
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  allowCreate?: boolean
  allowClear?: boolean
  className?: string
}

export function CategorySelector({
  userId,
  selectedCategory,
  onCategoryChange,
  allowCreate = true,
  allowClear = true,
  className,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<MemoryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
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
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createCategory",
          userId,
          category: {
            name: newCategoryName.trim(),
            description: null,
            color: getRandomColor(),
            icon: "tag",
            user_id: userId,
          },
        }),
      })

      const data = await response.json()
      if (data.category) {
        setCategories([...categories, data.category])
        onCategoryChange(data.category.name)
        setNewCategoryName("")
        setShowCreateForm(false)
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
    }
  }

  const getRandomColor = () => {
    const colors = [
      "#3b82f6", // blue
      "#10b981", // green
      "#f59e0b", // amber
      "#ef4444", // red
      "#8b5cf6", // violet
      "#ec4899", // pink
      "#6366f1", // indigo
      "#14b8a6", // teal
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const getSelectedCategoryName = () => {
    if (!selectedCategory) return "Select category"
    const category = categories.find((c) => c.name === selectedCategory)
    return category ? category.name : selectedCategory
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
          disabled={loading}
        >
          {loading ? (
            "Loading categories..."
          ) : (
            <>
              {selectedCategory ? (
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{
                      backgroundColor: categories.find((c) => c.name === selectedCategory)?.color || "#3b82f6",
                    }}
                  ></div>
                  {getSelectedCategoryName()}
                </div>
              ) : (
                "Select category"
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[200px]">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            <CommandEmpty>No categories found.</CommandEmpty>
            <CommandGroup>
              {allowClear && (
                <CommandItem
                  onSelect={() => {
                    onCategoryChange(null)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", !selectedCategory ? "opacity-100" : "opacity-0")} />
                  <span>No category</span>
                </CommandItem>
              )}
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  onSelect={() => {
                    onCategoryChange(category.name)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center w-full">
                    <Check
                      className={cn("mr-2 h-4 w-4", selectedCategory === category.name ? "opacity-100" : "opacity-0")}
                    />
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color || "#3b82f6" }}
                    ></div>
                    <span>{category.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {allowCreate && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  {showCreateForm ? (
                    <div className="p-2 space-y-2">
                      <input
                        className="w-full p-2 text-sm border rounded"
                        placeholder="New category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleCreateCategory()
                          }
                        }}
                      />
                      <div className="flex justify-between">
                        <Button variant="outline" size="sm" onClick={() => setShowCreateForm(false)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleCreateCategory} disabled={!newCategoryName.trim()}>
                          Create
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <CommandItem onSelect={() => setShowCreateForm(true)} className="text-blue-600">
                      <Plus className="mr-2 h-4 w-4" />
                      Create new category
                    </CommandItem>
                  )}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
