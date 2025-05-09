"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import {
  Globe,
  FileText,
  ImageIcon,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Save,
  Workflow,
  Plus,
  Trash,
} from "lucide-react"
import { createClientComponentClient } from "@/lib/db"
import type { CrewTask, CrewWorkflow } from "@/lib/crewai/crewai-service"

interface BlogScraperWorkflowProps {
  userId: number
  onSave?: (workflow: CrewWorkflow) => void
}

export function BlogScraperWorkflow({ userId, onSave }: BlogScraperWorkflowProps) {
  const [aiMembers, setAiMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [workflowName, setWorkflowName] = useState("Web Scraping to Blog Post")
  const [workflowDescription, setWorkflowDescription] = useState(
    "Scrape content from websites, analyze it, and generate blog posts with images.",
  )
  const [sourceUrls, setSourceUrls] = useState<string[]>([""])
  const [blogTopic, setBlogTopic] = useState("")
  const [blogStyle, setBlogStyle] = useState("informative")
  const [includeImages, setIncludeImages] = useState(true)
  const [requiresApproval, setRequiresApproval] = useState(true)
  const [adminNotes, setAdminNotes] = useState("")

  // Fetch AI family members
  useState(() => {
    const fetchAiMembers = async () => {
      setIsLoading(true)
      const supabase = createClientComponentClient()
      const { data, error } = await supabase.from("fm_ai_members").select("*").eq("user_id", userId).order("name")

      if (error) {
        console.error("Error fetching AI members:", error)
        toast({
          title: "Error",
          description: "Failed to load AI family members",
          variant: "destructive",
        })
      } else {
        setAiMembers(data || [])
      }
      setIsLoading(false)
    }

    fetchAiMembers()
  }, [userId])

  // Add a new URL input field
  const addUrlField = () => {
    setSourceUrls([...sourceUrls, ""])
  }

  // Remove a URL input field
  const removeUrlField = (index: number) => {
    const newUrls = [...sourceUrls]
    newUrls.splice(index, 1)
    setSourceUrls(newUrls)
  }

  // Update a URL value
  const updateUrl = (index: number, value: string) => {
    const newUrls = [...sourceUrls]
    newUrls[index] = value
    setSourceUrls(newUrls)
  }

  // Find AI member by specialty
  const findAiMemberBySpecialty = (specialty: string) => {
    const member = aiMembers.find((m) => m.specialty.toLowerCase().includes(specialty.toLowerCase()))
    return member?.id || aiMembers[0]?.id
  }

  // Create and save the workflow
  const saveWorkflow = async () => {
    if (!workflowName.trim()) {
      toast({
        title: "Error",
        description: "Workflow name is required",
        variant: "destructive",
      })
      return
    }

    if (sourceUrls.filter((url) => url.trim()).length === 0) {
      toast({
        title: "Error",
        description: "At least one valid source URL is required",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Create tasks for the workflow
      const tasks: Partial<CrewTask>[] = []

      // Find AI members for each role
      const scraperMemberId = findAiMemberBySpecialty("data")
      const writerMemberId = findAiMemberBySpecialty("content")
      const editorMemberId = findAiMemberBySpecialty("edit")
      const imageMemberId = findAiMemberBySpecialty("image")

      // 1. Web scraping tasks - one for each URL
      const scrapingTaskIds: string[] = []
      sourceUrls.forEach((url, index) => {
        if (!url.trim()) return

        const taskId = `task_scrape_${index}`
        scrapingTaskIds.push(taskId)

        tasks.push({
          title: `Scrape content from ${url}`,
          description: `Extract relevant information from the website for blog creation.`,
          type: "web_scraping",
          status: "pending",
          assignee_id: scraperMemberId,
          creator_id: userId,
          workflow_id: "",
          dependencies: [],
          input_data: { url, topic: blogTopic },
          output_data: null,
          priority: "high",
          due_date: null,
          id: taskId,
        })
      })

      // 2. Content analysis task
      const analysisTaskId = "task_analyze"
      tasks.push({
        title: "Analyze scraped content",
        description: "Review and analyze the scraped content to identify key themes and insights.",
        type: "data_analysis",
        status: "pending",
        assignee_id: editorMemberId,
        creator_id: userId,
        workflow_id: "",
        dependencies: scrapingTaskIds,
        input_data: { topic: blogTopic },
        output_data: null,
        priority: "medium",
        due_date: null,
        id: analysisTaskId,
      })

      // 3. Blog post creation task
      const blogCreationTaskId = "task_create_blog"
      tasks.push({
        title: "Create blog post",
        description: `Write a ${blogStyle} blog post based on the analyzed content.`,
        type: "content_creation",
        status: "pending",
        assignee_id: writerMemberId,
        creator_id: userId,
        workflow_id: "",
        dependencies: [analysisTaskId],
        input_data: {
          topic: blogTopic,
          style: blogStyle,
          instructions: `Create a ${blogStyle} blog post about ${blogTopic} using the analyzed content.`,
        },
        output_data: null,
        priority: "high",
        due_date: null,
        id: blogCreationTaskId,
      })

      // 4. Image generation task (if enabled)
      if (includeImages) {
        const imageTaskId = "task_create_images"
        tasks.push({
          title: "Generate images for blog post",
          description: "Create relevant images to accompany the blog post.",
          type: "image_generation",
          status: "pending",
          assignee_id: imageMemberId,
          creator_id: userId,
          workflow_id: "",
          dependencies: [blogCreationTaskId],
          input_data: {
            topic: blogTopic,
            prompt: `Create an engaging featured image for a blog post about ${blogTopic}.`,
          },
          output_data: null,
          priority: "medium",
          due_date: null,
          id: imageTaskId,
        })
      }

      // 5. Final review task
      const reviewTaskId = "task_review"
      tasks.push({
        title: "Review and finalize blog post",
        description: "Review the blog post and images, make final edits, and prepare for publishing.",
        type: "validation",
        status: "pending",
        assignee_id: editorMemberId,
        creator_id: userId,
        workflow_id: "",
        dependencies: includeImages ? ["task_create_images"] : [blogCreationTaskId],
        input_data: {},
        output_data: null,
        priority: "medium",
        due_date: null,
        id: reviewTaskId,
      })

      // Create the workflow object
      const workflow: Partial<CrewWorkflow> = {
        name: workflowName,
        description: workflowDescription,
        creator_id: userId,
        tasks: tasks as CrewTask[],
        status: "draft",
        requires_approval: requiresApproval,
        admin_notes: adminNotes || null,
      }

      // Save the workflow
      const response = await fetch("/api/crewai/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workflow),
      })

      if (!response.ok) {
        throw new Error("Failed to save workflow")
      }

      const savedWorkflow = await response.json()

      toast({
        title: "Workflow Created",
        description: "Your blog scraping workflow has been created successfully",
      })

      if (onSave) {
        onSave(savedWorkflow)
      }
    } catch (error) {
      console.error("Error saving workflow:", error)
      toast({
        title: "Error",
        description: "Failed to create workflow",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Workflow className="mr-2 h-5 w-5" />
          Create Web Scraping to Blog Post Workflow
        </CardTitle>
        <CardDescription>Design a workflow that scrapes content from websites and generates blog posts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="Enter workflow name"
                />
              </div>

              <div>
                <Label htmlFor="workflow-description">Description</Label>
                <Textarea
                  id="workflow-description"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Describe the purpose of this workflow"
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">Source URLs</h3>
              <p className="text-sm text-muted-foreground">Enter the URLs of websites to scrape for content</p>

              {sourceUrls.map((url, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    placeholder="https://example.com"
                  />
                  {sourceUrls.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeUrlField(index)}
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button variant="outline" onClick={addUrlField}>
                <Plus className="h-4 w-4 mr-2" />
                Add Another URL
              </Button>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">Blog Settings</h3>

              <div>
                <Label htmlFor="blog-topic">Blog Topic</Label>
                <Input
                  id="blog-topic"
                  value={blogTopic}
                  onChange={(e) => setBlogTopic(e.target.value)}
                  placeholder="Enter the main topic for the blog post"
                />
              </div>

              <div>
                <Label htmlFor="blog-style">Blog Style</Label>
                <Select value={blogStyle || ""} onValueChange={setBlogStyle}>
                  <SelectTrigger id="blog-style">
                    <SelectValue placeholder="Select blog style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="informative">Informative</SelectItem>
                    <SelectItem value="tutorial">Tutorial/How-to</SelectItem>
                    <SelectItem value="opinion">Opinion/Editorial</SelectItem>
                    <SelectItem value="listicle">List-based Article</SelectItem>
                    <SelectItem value="case-study">Case Study</SelectItem>
                    <SelectItem value="news">News Article</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="include-images" checked={includeImages} onCheckedChange={setIncludeImages} />
                <Label htmlFor="include-images">Generate images for the blog post</Label>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">Workflow Settings</h3>

              <div className="flex items-center space-x-2">
                <Switch id="requires-approval" checked={requiresApproval} onCheckedChange={setRequiresApproval} />
                <Label htmlFor="requires-approval">Requires admin approval before execution</Label>
              </div>

              {requiresApproval && (
                <div>
                  <Label htmlFor="admin-notes">Notes for Administrator</Label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes for the administrator reviewing this workflow"
                    rows={2}
                  />
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Workflow Preview</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Badge className="bg-blue-500 text-white">1</Badge>
                  <ArrowRight className="h-4 w-4 mx-2" />
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    <span>Web Scraping</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge className="bg-purple-500 text-white">2</Badge>
                  <ArrowRight className="h-4 w-4 mx-2" />
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>Content Analysis</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge className="bg-green-500 text-white">3</Badge>
                  <ArrowRight className="h-4 w-4 mx-2" />
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>Blog Post Creation</span>
                  </div>
                </div>
                {includeImages && (
                  <div className="flex items-center">
                    <Badge className="bg-amber-500 text-white">4</Badge>
                    <ArrowRight className="h-4 w-4 mx-2" />
                    <div className="flex items-center">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      <span>Image Generation</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <Badge className="bg-red-500 text-white">{includeImages ? "5" : "4"}</Badge>
                  <ArrowRight className="h-4 w-4 mx-2" />
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <span>Final Review</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={saveWorkflow} disabled={isSaving || isLoading}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Workflow...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Workflow
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
