"use client"

import { useState, useEffect } from "react"
import { TagCloud } from "react-tagcloud"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Memory } from "@/lib/mem0"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface MemoryTagCloudProps {
  memories: Memory[]
}

interface TagData {
  value: string
  count: number
  color?: string
}

interface TagCategoryData {
  name: string
  value: number
  color: string
}

export default function MemoryTagCloud({ memories }: MemoryTagCloudProps) {
  const [tagData, setTagData] = useState<TagData[]>([])
  const [categoryData, setCategoryData] = useState<TagCategoryData[]>([])

  useEffect(() => {
    if (!memories || memories.length === 0) return

    // Extract and count tags
    const tagCounts: Record<string, number> = {}
    const categoryCounts: Record<string, number> = {}

    memories.forEach((memory) => {
      // Extract tags from memory
      // This is a simplified approach - in a real implementation, you'd have a proper tagging system
      const content = memory.content.toLowerCase()

      // Extract potential tags (this is just a simple example)
      const words = content.split(/\s+/)
      const potentialTags = words
        .filter(
          (word) =>
            word.length > 3 && !["this", "that", "with", "from", "have", "were", "they", "their"].includes(word),
        )
        .slice(0, 5) // Take first 5 potential tags

      potentialTags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })

      // Categorize by memory type
      const category = memory.type || "unknown"
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })

    // Convert to tag cloud format
    const tags = Object.entries(tagCounts)
      .filter(([_, count]) => count > 1) // Only include tags that appear more than once
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50) // Take top 50 tags

    setTagData(tags)

    // Convert to category chart format
    const categoryColors: Record<string, string> = {
      episodic: "#ff6b6b",
      semantic: "#48dbfb",
      procedural: "#1dd1a1",
      unknown: "#c8d6e5",
    }

    const categories = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || "#c8d6e5",
    }))

    setCategoryData(categories)
  }, [memories])

  if (!memories || memories.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <p className="text-lg font-medium">No memory data available</p>
          <p className="text-muted-foreground">Add some memories to see tag analysis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="cloud" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="cloud">Tag Cloud</TabsTrigger>
          <TabsTrigger value="categories">Memory Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="cloud">
          <Card>
            <CardContent className="pt-6">
              {tagData.length > 0 ? (
                <div className="flex justify-center p-4">
                  <TagCloud
                    minSize={12}
                    maxSize={35}
                    tags={tagData}
                    onClick={(tag: TagData) => console.log(`'${tag.value}' was selected!`)}
                    colorOptions={{
                      luminosity: "dark",
                      hue: "blue",
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>Not enough tag data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardContent className="pt-6">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} memories`, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
