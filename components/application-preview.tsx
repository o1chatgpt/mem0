"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileEditor } from "@/components/file-editor"
import Mem0Integration from "@/components/mem0-integration"
import { Button } from "@/components/ui/button"
import { FileText, FolderOpen, Code, Brain, Globe, Key, Database, MessageSquare, Zap, Plus } from "lucide-react"

export default function ApplicationPreview() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="container mx-auto py-6">
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-2xl flex items-center">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            File Manager with API Integrations
          </CardTitle>
          <CardDescription>
            A powerful file management system with code editing, memory capabilities, and extensive API integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
              <TabsTrigger
                value="overview"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <FileText className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="editor"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <Code className="mr-2 h-4 w-4" />
                Code Editor
              </TabsTrigger>
              <TabsTrigger
                value="memory"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <Brain className="mr-2 h-4 w-4" />
                Memory System
              </TabsTrigger>
              <TabsTrigger
                value="api"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <Globe className="mr-2 h-4 w-4" />
                API Hub
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FolderOpen className="mr-2 h-5 w-5 text-primary" />
                      File Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Upload, download, and organize files</li>
                      <li>Create folders and manage file structure</li>
                      <li>Search files by name, type, or content</li>
                      <li>Share files with secure links</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Code className="mr-2 h-5 w-5 text-primary" />
                      Code Editor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Syntax highlighting for 20+ languages</li>
                      <li>Markdown preview with full formatting</li>
                      <li>Auto-save and version history</li>
                      <li>Code formatting and linting</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="mr-2 h-5 w-5 text-primary" />
                      Memory System
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Store and retrieve contextual information</li>
                      <li>Categorize memories for better organization</li>
                      <li>Search memories with relevance scoring</li>
                      <li>Memory statistics and insights</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="mr-2 h-5 w-5 text-primary" />
                      API Integrations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Connect to AI models (OpenAI, Anthropic, etc.)</li>
                      <li>Database integrations (Supabase, Neon, etc.)</li>
                      <li>Storage services (Vercel Blob, S3, etc.)</li>
                      <li>Authentication providers (Auth0, OAuth, etc.)</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="editor" className="p-6">
              <div className="h-[400px] border rounded-md overflow-hidden">
                <FileEditor
                  fileId="preview"
                  fileName="example.md"
                  initialContent="# Welcome to the File Manager\n\nThis is a **markdown** preview example.\n\n## Features\n\n- Syntax highlighting\n- Live preview\n- Multiple language support\n\n\`\`\`javascript\nfunction hello() {\n  console.log('Hello, world!');\n}\n\`\`\`"
                  readOnly={true}
                />
              </div>
            </TabsContent>

            <TabsContent value="memory" className="p-6">
              <div className="h-[400px] overflow-auto">
                <Mem0Integration userId={1} />
              </div>
            </TabsContent>

            <TabsContent value="api" className="p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Available API Integrations</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md flex items-center">
                        <Key className="mr-2 h-4 w-4 text-green-500" />
                        OpenAI
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">Connect to GPT models for AI capabilities</p>
                      <Button size="sm" variant="outline" className="w-full">
                        Configure
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md flex items-center">
                        <Database className="mr-2 h-4 w-4 text-blue-500" />
                        Supabase
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">Database and authentication services</p>
                      <Button size="sm" variant="outline" className="w-full">
                        Configure
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md flex items-center">
                        <MessageSquare className="mr-2 h-4 w-4 text-purple-500" />
                        Anthropic
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">Claude AI models for natural language</p>
                      <Button size="sm" variant="outline" className="w-full">
                        Configure
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md flex items-center">
                        <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                        Vercel Blob
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">File storage and CDN services</p>
                      <Button size="sm" variant="outline" className="w-full">
                        Configure
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center mt-4">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Integration
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
