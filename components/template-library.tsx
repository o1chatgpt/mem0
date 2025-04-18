"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, ExternalLink, ThumbsUp, Star } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { templateToShareableString, getTemplateFilename } from "@/lib/template-utils"
import type { TemplateExport } from "@/lib/template-utils"

// Sample community templates
const communityTemplates: (TemplateExport & {
  likes: number
  downloads: number
  author: string
  tags: string[]
  featured?: boolean
})[] = [
  {
    name: "Research Assistant",
    description: "Specialized template for academic research and paper organization",
    prompt_template: `You are a research assistant with memory capabilities.
Focus on helping the user organize research materials, find relevant information, and synthesize knowledge.

When responding to research-related queries:
1. Remember the user's research topics and interests
2. Suggest effective search strategies for academic sources
3. Help organize research notes and citations
4. Provide summaries of complex information
5. Connect new information with previously discussed research

Prioritize accuracy and scholarly rigor in your responses.
Maintain an objective, analytical tone appropriate for academic work.`,
    color: "#4B0082",
    author: "AcademicAI",
    likes: 128,
    downloads: 342,
    tags: ["academic", "research", "organization"],
    featured: true,
    metadata: {
      version: "1.2.0",
      created: "2023-09-15T12:00:00Z",
    },
  },
  {
    name: "Project Planner",
    description: "Helps with project planning, task management, and deadlines",
    prompt_template: `You are a project planning assistant with memory capabilities.
Focus on helping the user plan, organize, and track projects and tasks.

When responding to project management queries:
1. Remember project deadlines, milestones, and priorities
2. Suggest effective task breakdown and organization
3. Help track progress and identify bottlenecks
4. Provide reminders for upcoming deadlines
5. Recommend time management and productivity strategies

Maintain a balance between detail-oriented planning and big-picture thinking.
Adapt your approach based on project complexity and the user's management style.`,
    color: "#008080",
    author: "ProductivityPro",
    likes: 87,
    downloads: 215,
    tags: ["productivity", "planning", "organization"],
    metadata: {
      version: "1.0.1",
      created: "2023-10-02T15:30:00Z",
    },
  },
  {
    name: "Creative Writing Coach",
    description: "Assists with creative writing, storytelling, and character development",
    prompt_template: `You are a creative writing coach with memory capabilities.
Focus on helping the user develop stories, characters, and creative writing projects.

When responding to creative writing queries:
1. Remember the user's stories, characters, and creative elements
2. Provide constructive feedback on writing style and narrative
3. Suggest creative directions and plot developments
4. Help overcome writer's block with targeted prompts
5. Maintain consistency with previously established story elements

Encourage the user's unique voice and creative vision.
Balance technical writing advice with creative encouragement.`,
    color: "#9932CC",
    author: "StoryWeaver",
    likes: 103,
    downloads: 278,
    tags: ["creative", "writing", "storytelling"],
    featured: true,
    metadata: {
      version: "1.1.0",
      created: "2023-08-22T09:45:00Z",
    },
  },
]

export function TemplateLibrary() {
  const [downloadedTemplates, setDownloadedTemplates] = useState<Set<number>>(new Set())

  const handleDownload = (template: TemplateExport, index: number) => {
    // Create a blob from the template JSON
    const shareableString = templateToShareableString(template)
    const blob = new Blob([shareableString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    // Create a temporary link and trigger download
    const a = document.createElement("a")
    a.href = url
    a.download = getTemplateFilename(template)
    document.body.appendChild(a)
    a.click()

    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Mark as downloaded
    setDownloadedTemplates((prev) => new Set([...prev, index]))

    toast({
      title: "Template downloaded",
      description: `Successfully downloaded "${template.name}" template`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Template Library</CardTitle>
        <CardDescription>Browse and download templates shared by the community</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communityTemplates.map((template, index) => (
            <Card key={index} className={`overflow-hidden ${template.featured ? "border-primary" : ""}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      {template.name}
                      {template.featured && (
                        <Badge variant="default" className="ml-2">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex space-x-2 mb-2">
                  {template.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <span className="font-medium">Author:</span>
                    <span className="ml-1">{template.author}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    <span>{template.likes} likes</span>
                    <Download className="h-3 w-3 ml-3 mr-1" />
                    <span>{template.downloads} downloads</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownload(template, index)}>
                  <Download className="h-4 w-4 mr-2" />
                  {downloadedTemplates.has(index) ? "Downloaded" : "Download Template"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div>Showing {communityTemplates.length} community templates</div>
        <Button variant="link" size="sm" className="h-auto p-0">
          <ExternalLink className="h-3 w-3 mr-1" />
          View more templates online
        </Button>
      </CardFooter>
    </Card>
  )
}
