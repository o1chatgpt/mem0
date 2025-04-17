"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { EnhancedFileExplorer } from "./enhanced-file-explorer"
import { MultiFormatEditor } from "./multi-format-editor"
import { AIDocumentAnalyzer } from "./ai-document-analyzer"
import { FileText, Settings, Code, Package, Layers, Cpu, Zap, Workflow, Boxes, Braces, FileJson } from "lucide-react"

export function DocumentEcosystem() {
  const [activeTab, setActiveTab] = useState("files")
  const [selectedStack, setSelectedStack] = useState<"vite" | "nodejs" | "shadcn" | "tailwind" | null>(null)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-xl font-bold">AI Document Ecosystem</h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 pt-4">
              <TabsList className="w-full">
                <TabsTrigger value="files" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Files
                </TabsTrigger>
                <TabsTrigger value="integration" className="flex-1">
                  <Code className="h-4 w-4 mr-2" />
                  Integration
                </TabsTrigger>
                <TabsTrigger value="ecosystem" className="flex-1">
                  <Boxes className="h-4 w-4 mr-2" />
                  Ecosystem
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="files" className="flex-1 overflow-hidden p-0 pt-4">
              <div className="flex h-full overflow-hidden">
                <EnhancedFileExplorer />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-hidden">
                    <MultiFormatEditor />
                  </div>
                  <div className="h-1/3 mt-4 px-6">
                    <AIDocumentAnalyzer />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integration" className="flex-1 p-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Integration Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Card
                      className={`cursor-pointer hover:border-primary transition-colors ${
                        selectedStack === "vite" ? "border-primary" : ""
                      }`}
                      onClick={() => setSelectedStack("vite")}
                    >
                      <CardContent className="p-6 flex flex-col items-center">
                        <Zap className="h-12 w-12 mb-4 text-yellow-500" />
                        <h3 className="text-lg font-medium mb-2">Vite</h3>
                        <p className="text-sm text-center text-muted-foreground mb-4">
                          Fast, modern frontend build tool with instant HMR
                        </p>
                        <Badge>Frontend</Badge>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer hover:border-primary transition-colors ${
                        selectedStack === "nodejs" ? "border-primary" : ""
                      }`}
                      onClick={() => setSelectedStack("nodejs")}
                    >
                      <CardContent className="p-6 flex flex-col items-center">
                        <Cpu className="h-12 w-12 mb-4 text-green-500" />
                        <h3 className="text-lg font-medium mb-2">Node.js</h3>
                        <p className="text-sm text-center text-muted-foreground mb-4">
                          JavaScript runtime for building scalable server-side applications
                        </p>
                        <Badge>Backend</Badge>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer hover:border-primary transition-colors ${
                        selectedStack === "shadcn" ? "border-primary" : ""
                      }`}
                      onClick={() => setSelectedStack("shadcn")}
                    >
                      <CardContent className="p-6 flex flex-col items-center">
                        <Layers className="h-12 w-12 mb-4 text-purple-500" />
                        <h3 className="text-lg font-medium mb-2">shadcn/ui</h3>
                        <p className="text-sm text-center text-muted-foreground mb-4">
                          Beautifully designed components built with Radix UI and Tailwind
                        </p>
                        <Badge>UI Components</Badge>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer hover:border-primary transition-colors ${
                        selectedStack === "tailwind" ? "border-primary" : ""
                      }`}
                      onClick={() => setSelectedStack("tailwind")}
                    >
                      <CardContent className="p-6 flex flex-col items-center">
                        <Workflow className="h-12 w-12 mb-4 text-blue-500" />
                        <h3 className="text-lg font-medium mb-2">Tailwind CSS</h3>
                        <p className="text-sm text-center text-muted-foreground mb-4">
                          Utility-first CSS framework for rapid UI development
                        </p>
                        <Badge>Styling</Badge>
                      </CardContent>
                    </Card>
                  </div>

                  {selectedStack && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4">Integration Steps</h3>
                      <div className="bg-muted p-4 rounded-md">
                        <p className="text-sm mb-4">
                          Follow these steps to integrate your document ecosystem with{" "}
                          {selectedStack === "vite"
                            ? "Vite"
                            : selectedStack === "nodejs"
                              ? "Node.js"
                              : selectedStack === "shadcn"
                                ? "shadcn/ui"
                                : "Tailwind CSS"}
                          :
                        </p>

                        {selectedStack === "vite" && (
                          <pre className="text-xs p-4 bg-black text-green-400 rounded-md overflow-auto">
                            <code>{`# Create a new Vite project
npm create vite@latest my-document-app -- --template react-ts

# Navigate to the project
cd my-document-app

# Install dependencies
npm install

# Add document ecosystem dependencies
npm install @monaco-editor/react yaml js-yaml marked

# Start development server
npm run dev`}</code>
                          </pre>
                        )}

                        {selectedStack === "nodejs" && (
                          <pre className="text-xs p-4 bg-black text-green-400 rounded-md overflow-auto">
                            <code>{`# Create a new Node.js project
mkdir document-api
cd document-api
npm init -y

# Install dependencies
npm install express cors body-parser dotenv

# Add document processing libraries
npm install markdown-it js-yaml jsonwebtoken openai

# Create server file
echo "const express = require('express');" > server.js

# Start server
node server.js`}</code>
                          </pre>
                        )}

                        {selectedStack === "shadcn" && (
                          <pre className="text-xs p-4 bg-black text-green-400 rounded-md overflow-auto">
                            <code>{`# Create a new Next.js project with shadcn/ui
npx create-next-app@latest my-document-app --typescript --tailwind --eslint

# Navigate to the project
cd my-document-app

# Add shadcn/ui
npx shadcn@latest init

# Add document-related components
npx shadcn@latest add card tabs textarea button badge separator

# Start development server
npm run dev`}</code>
                          </pre>
                        )}

                        {selectedStack === "tailwind" && (
                          <pre className="text-xs p-4 bg-black text-green-400 rounded-md overflow-auto">
                            <code>{`# Create a new project
mkdir document-app
cd document-app
npm init -y

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Configure Tailwind
echo "module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}" > tailwind.config.js

# Create CSS file
mkdir -p src/styles
echo "@tailwind base;
@tailwind components;
@tailwind utilities;" > src/styles/tailwind.css`}</code>
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ecosystem" className="flex-1 p-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Document Ecosystem</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <Package className="h-4 w-4 mr-2" />
                          OpenAI Integration
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Connect your document ecosystem to OpenAI's powerful models for advanced AI capabilities.
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            Configure
                          </Button>
                          <Badge variant="outline">API Key Required</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <Braces className="h-4 w-4 mr-2" />
                          Format Conversion
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Convert between Markdown, YAML, JSON, JSONL, and other formats with intelligent preservation
                          of structure.
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            Settings
                          </Button>
                          <Badge>Built-in</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <FileJson className="h-4 w-4 mr-2" />
                          Environment Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Manage .env files, secrets, and configuration across different environments with validation
                          and suggestions.
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            Configure
                          </Button>
                          <Badge>Built-in</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <Zap className="h-4 w-4 mr-2" />
                          AI Document Assistant
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Get AI-powered suggestions, formatting help, and content generation for your documents.
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            Enable
                          </Button>
                          <Badge variant="outline">Requires OpenAI</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
