"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { parseToolYaml } from "@/lib/yaml-parser"
import { createTool, createAppRoute } from "@/lib/db/tool-system"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Play, Code, Eye } from "lucide-react"
import Link from "next/link"

export default function ToolDesignerPage() {
  const [yamlContent, setYamlContent] = useState(`name: Image Generator
description: Create AI-powered images using prompts
route: /app/image-generator
type: creative
toolkit:
  - input: prompt
  - config: style
  - config: resolution
voice_trigger: "Generate an image of"
`)
  const [activeTab, setActiveTab] = useState("yaml")
  const [previewTool, setPreviewTool] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const handleYamlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setYamlContent(e.target.value)
  }

  const handlePreview = () => {
    const parsedTool = parseToolYaml(yamlContent)
    setPreviewTool(parsedTool)

    if (parsedTool) {
      setActiveTab("preview")
      toast({
        title: "Tool Preview Generated",
        description: "Your tool definition has been parsed successfully.",
      })
    } else {
      toast({
        title: "Error Parsing YAML",
        description: "Please check your YAML syntax and try again.",
        variant: "destructive",
      })
    }
  }

  const handleCreateTool = async () => {
    try {
      setIsCreating(true)
      const parsedTool = parseToolYaml(yamlContent)

      if (!parsedTool) {
        throw new Error("Failed to parse tool definition")
      }

      // Create the tool in the database
      const createdTool = await createTool(parsedTool)

      if (!createdTool) {
        throw new Error("Failed to create tool")
      }

      // Create the app route
      const appRoute = await createAppRoute({
        route: parsedTool.route,
        component_path: `/app/dynamic-tools/${createdTool.id}`,
        is_active: true,
      })

      if (!appRoute) {
        throw new Error("Failed to create app route")
      }

      toast({
        title: "Tool Created Successfully",
        description: `${createdTool.name} has been created and is now available.`,
      })

      // Reset form or redirect
      // window.location.href = `/admin/tools/${createdTool.id}`;
    } catch (error) {
      console.error("Error creating tool:", error)
      toast({
        title: "Error Creating Tool",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Tool Designer</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="yaml" className="flex items-center">
            <Code className="mr-2 h-4 w-4" />
            YAML Definition
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="assign" className="flex items-center">
            <Play className="mr-2 h-4 w-4" />
            Assign & Deploy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="yaml" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tool Definition</CardTitle>
              <CardDescription>
                Define your tool using YAML syntax. This will be used to generate the tool interface and functionality.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={yamlContent} onChange={handleYamlChange} className="font-mono h-[500px]" />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handlePreview} className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                Preview Tool
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tool Preview</CardTitle>
              <CardDescription>Preview how your tool will look and function.</CardDescription>
            </CardHeader>
            <CardContent>
              {previewTool ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{previewTool.name}</h3>
                    <p className="text-gray-500">{previewTool.description}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold">Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Route:</span> {previewTool.route}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {previewTool.type}
                      </div>
                      <div>
                        <span className="font-medium">Slug:</span> {previewTool.slug}
                      </div>
                      <div>
                        <span className="font-medium">Voice Trigger:</span> {previewTool.voice_trigger || "None"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Toolkit</h4>
                    {previewTool.toolkit && previewTool.toolkit.length > 0 ? (
                      <div className="space-y-4">
                        {previewTool.toolkit.map((item: any, index: number) => (
                          <div key={index} className="p-4 border rounded-md">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">
                                {item.type}: {item.name}
                              </h5>
                            </div>
                            {item.type === "input" && <Input placeholder={`Enter ${item.name}...`} />}
                            {item.type === "select" && (
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder={`Select ${item.name}...`} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="option1">Option 1</SelectItem>
                                  <SelectItem value="option2">Option 2</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            {item.type === "config" && (
                              <div className="flex items-center space-x-2">
                                <Label>{item.name}:</Label>
                                <Input placeholder={`Configure ${item.name}...`} className="max-w-xs" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No toolkit items defined.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No preview available. Generate a preview from the YAML definition.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("yaml")}>
                Back to Editor
              </Button>
              <Button onClick={() => setActiveTab("assign")} disabled={!previewTool}>
                Continue to Assign
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="assign" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Assign & Deploy Tool</CardTitle>
              <CardDescription>
                Assign this tool to AI family members and deploy it to your application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Assign to AI Family Members</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="stan" className="rounded" />
                      <Label htmlFor="stan">Stan (Technical Lead)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="lyra" className="rounded" />
                      <Label htmlFor="lyra">Lyra (Home Assistant)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="sophia" className="rounded" />
                      <Label htmlFor="sophia">Sophia (Creative Director)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="max" className="rounded" />
                      <Label htmlFor="max">Max (Education Specialist)</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Deployment Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="generate-page" className="rounded" checked disabled />
                      <Label htmlFor="generate-page">Generate Page Component</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="register-route" className="rounded" checked disabled />
                      <Label htmlFor="register-route">Register Route</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="enable-voice" className="rounded" />
                      <Label htmlFor="enable-voice">Enable Voice Triggers</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("preview")}>
                Back to Preview
              </Button>
              <Button onClick={handleCreateTool} disabled={isCreating} className="flex items-center">
                {isCreating ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create & Deploy Tool
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
