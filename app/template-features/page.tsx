"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, Lightbulb, Zap, Sparkles, BarChart } from "lucide-react"
import Link from "next/link"
import { TemplateFeatureShowcase } from "@/components/template-feature-showcase"
import { TemplateExampleCard } from "@/components/template-example-card"

export default function TemplateFeatures() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Template System</h1>
        </div>
        <div className="flex space-x-2">
          <Link href="/template-analytics">
            <Button variant="outline">
              <BarChart className="mr-2 h-4 w-4" />
              Analytics Dashboard
            </Button>
          </Link>
          <Link href="/memory-categories/templates">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Browse Templates
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="guide">How-to Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Template System Overview</CardTitle>
              <CardDescription>Enhance your AI interactions with customizable prompt templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                      What are Templates?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Templates are pre-defined instructions that guide how the AI responds to your queries. They help
                      the AI understand the context, tone, and focus areas for different types of interactions.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Zap className="mr-2 h-5 w-5 text-purple-500" />
                      Why Use Templates?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Templates provide consistent, specialized responses for different tasks. They help the AI remember
                      context, follow specific guidelines, and deliver more relevant and helpful information.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 text-blue-500" />
                      Key Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Specialized AI responses for different tasks</li>
                      <li>Consistent interaction patterns</li>
                      <li>Better context retention</li>
                      <li>Community-driven template sharing</li>
                      <li>Customizable to your specific needs</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">How Templates Work with Memory</h3>
                <p className="mb-4">
                  Templates work hand-in-hand with the memory system to create a powerful, context-aware AI assistant.
                  When you assign a template to a memory category:
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>The AI uses the template as a guide for how to respond to queries related to that category</li>
                  <li>
                    Memories from that category are prioritized and interpreted according to the template instructions
                  </li>
                  <li>
                    The AI maintains a consistent approach to similar queries, creating a more cohesive experience
                  </li>
                  <li>
                    Your preferences and past interactions are remembered and applied within the template's framework
                  </li>
                </ol>
              </div>

              <div className="flex justify-center mt-6">
                <Link href="/memory-categories/templates">
                  <Button size="lg">
                    <FileText className="mr-2 h-5 w-5" />
                    Explore Template Library
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <TemplateFeatureShowcase />
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TemplateExampleCard
              title="Research Assistant"
              description="Specialized template for academic research and paper organization"
              category="Academic"
              color="#4B0082"
              template={`You are a research assistant with memory capabilities.
Focus on helping the user organize research materials, find relevant information, and synthesize knowledge.

When responding to research-related queries:
1. Remember the user's research topics and interests
2. Suggest effective search strategies for academic sources
3. Help organize research notes and citations
4. Provide summaries of complex information
5. Connect new information with previously discussed research

Prioritize accuracy and scholarly rigor in your responses.
Maintain an objective, analytical tone appropriate for academic work.`}
            />

            <TemplateExampleCard
              title="Creative Writing Coach"
              description="Assists with creative writing, storytelling, and character development"
              category="Creative"
              color="#9932CC"
              template={`You are a creative writing coach with memory capabilities.
Focus on helping the user develop stories, characters, and creative writing projects.

When responding to creative writing queries:
1. Remember the user's stories, characters, and creative elements
2. Provide constructive feedback on writing style and narrative
3. Suggest creative directions and plot developments
4. Help overcome writer's block with targeted prompts
5. Maintain consistency with previously established story elements

Encourage the user's unique voice and creative vision.
Balance technical writing advice with creative encouragement.`}
            />

            <TemplateExampleCard
              title="File Organizer"
              description="Helps users organize their files and folders efficiently"
              category="Productivity"
              color="#008080"
              template={`You are a file organization expert with memory capabilities.
Focus on helping the user organize their digital files and folders efficiently.

When responding to queries about file management:
1. Suggest clear, consistent naming conventions
2. Recommend logical folder hierarchies
3. Advise on best practices for file organization
4. Remember the user's previous organization preferences
5. Provide specific, actionable advice rather than general tips

If the user asks about specific file types (images, documents, etc.), tailor your recommendations to those file types.
Always prioritize simplicity and ease of maintenance in your suggestions.`}
            />

            <TemplateExampleCard
              title="Technical Advisor"
              description="Provides technical guidance and troubleshooting help"
              category="Technical"
              color="#B22222"
              template={`You are a technical advisor with memory capabilities.
Focus on providing clear, accurate technical information and troubleshooting guidance.

When responding to technical queries:
1. Remember the user's technical environment and previous issues
2. Provide step-by-step instructions for technical tasks
3. Explain complex concepts in accessible language
4. Suggest best practices for technical workflows
5. Reference relevant documentation and resources

Prioritize accuracy and clarity in your explanations.
Adapt your technical depth based on the user's demonstrated expertise level.`}
            />
          </div>
        </TabsContent>

        <TabsContent value="guide" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How to Use the Template System</CardTitle>
              <CardDescription>A step-by-step guide to creating, using, and sharing templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Creating Templates</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <strong>Navigate to Memory Categories:</strong> Go to the Memory Categories page from the Mem0
                    Integration section
                  </li>
                  <li>
                    <strong>Select a Category:</strong> Choose an existing category or create a new one
                  </li>
                  <li>
                    <strong>Edit the Template:</strong> Click the "Edit" button on the category's prompt template card
                  </li>
                  <li>
                    <strong>Write Your Template:</strong> Follow the template writing guidelines to create effective
                    instructions
                  </li>
                  <li>
                    <strong>Save Your Template:</strong> Click "Save" to apply your template to the category
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Using Templates</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <strong>Open the Chat Interface:</strong> Go to the Mem0 Chat component
                  </li>
                  <li>
                    <strong>Select a Category:</strong> Use the category filter to select a category with your template
                  </li>
                  <li>
                    <strong>Start Chatting:</strong> The AI will now use your template to guide its responses
                  </li>
                  <li>
                    <strong>Categorize Memories:</strong> Assign memories to categories to use specific templates for
                    different topics
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Sharing Templates</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <strong>Open a Template:</strong> Navigate to the template you want to share
                  </li>
                  <li>
                    <strong>Click Share:</strong> Use the "Share" button to open the sharing dialog
                  </li>
                  <li>
                    <strong>Choose Sharing Method:</strong> Copy the template JSON or download it as a file
                  </li>
                  <li>
                    <strong>Send to Others:</strong> Share the JSON or file via your preferred method
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Importing Templates</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <strong>Click Import:</strong> Use the "Import Template" button on the Memory Categories page
                  </li>
                  <li>
                    <strong>Provide Template Data:</strong> Paste the template JSON or upload a template file
                  </li>
                  <li>
                    <strong>Review and Confirm:</strong> Check the template preview and click "Import"
                  </li>
                  <li>
                    <strong>Start Using:</strong> The imported template is now available in your categories
                  </li>
                </ol>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Template Writing Tips</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Start with a clear role definition for the AI</li>
                  <li>Specify the focus areas and priorities</li>
                  <li>Include specific instructions for how to respond to different query types</li>
                  <li>Mention how to use memories and past interactions</li>
                  <li>Keep templates concise but specific (3-10 paragraphs is ideal)</li>
                  <li>Test and refine templates based on the responses you receive</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
