"use client"

import { useState } from "react"
import { Book, Search, FileText, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMem0 } from "@/components/mem0/mem0-provider"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

type DocItem = {
  id: string
  title: string
  category: string
  content: string
  tags?: string[]
}

const sampleDocs: DocItem[] = [
  {
    id: "doc1",
    title: "Getting Started with File Manager",
    category: "Guides",
    content:
      "This guide will help you get started with the File Manager application. Learn how to navigate, upload files, and organize your content effectively.",
    tags: ["beginner", "tutorial"],
  },
  {
    id: "doc2",
    title: "Using Memory Features",
    category: "Guides",
    content:
      "The File Manager includes powerful memory features powered by Mem0. This allows the application to remember your preferences and provide personalized suggestions based on your usage patterns.",
    tags: ["memory", "AI", "personalization"],
  },
  {
    id: "doc3",
    title: "API Documentation",
    category: "Reference",
    content:
      "Complete API documentation for developers who want to integrate with the File Manager system or extend its functionality.",
    tags: ["api", "development", "integration"],
  },
  {
    id: "doc4",
    title: "Security Best Practices",
    category: "Guides",
    content:
      "Learn about the security features of the File Manager and best practices for keeping your files safe and secure.",
    tags: ["security", "privacy", "protection"],
  },
  {
    id: "doc5",
    title: "Troubleshooting Common Issues",
    category: "Support",
    content: "Solutions for common issues you might encounter while using the File Manager application.",
    tags: ["help", "support", "troubleshooting"],
  },
  {
    id: "doc6",
    title: "AI Family Toolkit Overview",
    category: "Guides",
    content: "An overview of the AI Family Toolkit and how it can help you manage your files and documents.",
    tags: ["overview", "AI", "toolkit"],
  },
]

export function TechnicalDocPanel() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const { addMemory, isInitialized } = useMem0()

  const filteredDocs = sampleDocs.filter((doc) => {
    // Filter by search query
    const matchesSearch =
      !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    // Filter by selected tag
    const matchesTag = !selectedTag || doc.tags?.includes(selectedTag)

    return matchesSearch && matchesTag
  })

  const handleDocClick = (doc: DocItem) => {
    setSelectedDoc(doc)

    // Record this interaction in mem0
    if (isInitialized) {
      addMemory(`User viewed documentation: ${doc.title}`)
    }
  }

  const handleBackClick = () => {
    setSelectedDoc(null)
    setSelectedTag(null)
  }

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null)
    } else {
      setSelectedTag(tag)

      // Record this interaction in mem0
      if (isInitialized) {
        addMemory(`User filtered documentation by tag: ${tag}`)
      }
    }
  }

  // Get all unique tags
  const allTags = Array.from(new Set(sampleDocs.flatMap((doc) => doc.tags || []))).sort()

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center">
        <Book className="h-5 w-5 mr-2" />
        <h2 className="text-xl font-semibold">Documentation</h2>
      </div>

      {!selectedDoc ? (
        <>
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {allTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4">
            {filteredDocs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {searchQuery
                  ? `No documentation found for "${searchQuery}"`
                  : selectedTag
                    ? `No documentation found with tag "${selectedTag}"`
                    : "No documentation available"}
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredDocs.map((doc) => (
                  <Card
                    key={doc.id}
                    className="p-3 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleDocClick(doc)}
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">{doc.title}</span>
                    </div>
                    <div className="mt-1">
                      <Badge variant="secondary" className="mr-2">
                        {doc.category}
                      </Badge>
                      {doc.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="mr-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{doc.content}</p>
                  </Card>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="p-4 border-b">
            <Button variant="ghost" size="sm" onClick={handleBackClick} className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to list
            </Button>
          </div>

          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2">{selectedDoc.title}</h3>
            <div className="flex flex-wrap gap-1 mb-4">
              <Badge variant="secondary">{selectedDoc.category}</Badge>
              {selectedDoc.tags?.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="mt-4 prose dark:prose-invert max-w-none">
              <p>{selectedDoc.content}</p>

              {/* This would be expanded with more detailed content in a real application */}
              <h4 className="text-lg font-medium mt-6">Overview</h4>
              <p>
                This documentation provides detailed information about using the {selectedDoc.title.toLowerCase()}
                feature in the AI Family Toolkit application.
              </p>

              <h4 className="text-lg font-medium mt-6">Key Features</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Intelligent file organization with AI-powered suggestions</li>
                <li>Memory features that learn from your usage patterns</li>
                <li>Seamless integration with OpenAI for enhanced capabilities</li>
                <li>Dark mode support for comfortable viewing in any environment</li>
              </ul>

              <h4 className="text-lg font-medium mt-6">Related Documentation</h4>
              <ul className="space-y-2">
                {sampleDocs
                  .filter((doc) => doc.id !== selectedDoc.id)
                  .slice(0, 3)
                  .map((doc) => (
                    <li key={doc.id}>
                      <Button variant="link" className="p-0 h-auto text-sm" onClick={() => handleDocClick(doc)}>
                        {doc.title}
                      </Button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
