"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  FileCode,
  FilePlus,
  FolderPlus,
  Upload,
  Brain,
  Search,
  Tag,
  History,
  Share2,
  Clock,
  Star,
  ImageIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ExampleFile {
  id: string
  name: string
  type: string
  icon: React.ReactNode
  description: string
  tags: string[]
  lastModified: string
}

const exampleFiles: ExampleFile[] = [
  {
    id: "doc1",
    name: "Project Proposal.docx",
    type: "document",
    icon: <FileText className="h-8 w-8 text-blue-500" />,
    description: "A comprehensive project proposal for the new marketing campaign",
    tags: ["work", "important", "proposal"],
    lastModified: "2 hours ago",
  },
  {
    id: "img1",
    name: "Product Mockup.png",
    type: "image",
    icon: <ImageIcon className="h-8 w-8 text-green-500" />,
    description: "Product design mockup for the upcoming release",
    tags: ["design", "product"],
    lastModified: "Yesterday",
  },
  {
    id: "code1",
    name: "app.js",
    type: "code",
    icon: <FileCode className="h-8 w-8 text-yellow-500" />,
    description: "Main application code with recent bug fixes",
    tags: ["code", "javascript", "bugfix"],
    lastModified: "3 days ago",
  },
  {
    id: "doc2",
    name: "Meeting Notes.md",
    type: "document",
    icon: <FileText className="h-8 w-8 text-purple-500" />,
    description: "Notes from the weekly team meeting with action items",
    tags: ["notes", "meeting", "team"],
    lastModified: "1 week ago",
  },
]

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center space-x-2">
        <div className="p-2 rounded-full bg-primary/10">{icon}</div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
)

export function WelcomeScreen({ onDismiss }: { onDismiss: () => void }) {
  const [activeTab, setActiveTab] = useState("examples")

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Brain className="h-8 w-8 mr-2 text-primary" />
            Smart File Manager
          </h1>
          <p className="text-muted-foreground">
            Intelligent file management with AI assistance and memory capabilities
          </p>
        </div>
        <Button onClick={onDismiss}>Get Started</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="examples">Example Files</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="ai">AI Capabilities</TabsTrigger>
        </TabsList>

        <TabsContent value="examples">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exampleFiles.map((file) => (
              <Card key={file.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start">
                    <div className="mr-3">{file.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{file.name}</CardTitle>
                      <CardDescription className="text-sm">{file.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {file.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 text-xs text-muted-foreground">
                  Last modified: {file.lastModified}
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="mt-6 flex justify-center space-x-4">
            <Button variant="outline" className="flex items-center">
              <FilePlus className="h-4 w-4 mr-2" />
              Create New File
            </Button>
            <Button variant="outline" className="flex items-center">
              <FolderPlus className="h-4 w-4 mr-2" />
              Create New Folder
            </Button>
            <Button variant="outline" className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="features">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              title="Smart File Organization"
              description="Automatically organize files based on content, usage patterns, and AI-powered suggestions."
              icon={<Brain className="h-5 w-5 text-primary" />}
            />
            <FeatureCard
              title="Advanced Search"
              description="Find files quickly with natural language search, content-based queries, and semantic understanding."
              icon={<Search className="h-5 w-5 text-primary" />}
            />
            <FeatureCard
              title="Intelligent Tagging"
              description="Auto-generate and manage tags for your files based on content analysis and usage patterns."
              icon={<Tag className="h-5 w-5 text-primary" />}
            />
            <FeatureCard
              title="Usage History"
              description="Track and visualize your file usage patterns with detailed history and analytics."
              icon={<History className="h-5 w-5 text-primary" />}
            />
            <FeatureCard
              title="Collaboration Tools"
              description="Share files securely and collaborate with team members in real-time with version control."
              icon={<Share2 className="h-5 w-5 text-primary" />}
            />
            <FeatureCard
              title="Memory Features"
              description="The system remembers your preferences, frequently used files, and work patterns."
              icon={<Brain className="h-5 w-5 text-primary" />}
            />
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered File Management</CardTitle>
              <CardDescription>
                Smart File Manager uses advanced AI to enhance your file management experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium flex items-center mb-2">
                    <Brain className="h-4 w-4 mr-2 text-primary" />
                    Content Understanding
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    AI analyzes file contents to provide better search results, automatic tagging, and content-based
                    recommendations.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    Usage Pattern Recognition
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The system learns from your usage patterns to predict which files you'll need and when you'll need
                    them.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium flex items-center mb-2">
                    <Star className="h-4 w-4 mr-2 text-primary" />
                    Smart Recommendations
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get intelligent file and action recommendations based on your current context and past behavior.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium flex items-center mb-2">
                    <Search className="h-4 w-4 mr-2 text-primary" />
                    Natural Language Search
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Search for files using natural language queries like "find the presentation I worked on last week."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
