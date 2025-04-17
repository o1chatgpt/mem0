"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { smartMemoryService } from "@/lib/smart-memory-service"
import { Brain, RefreshCw, FileText, AlertTriangle, Lightbulb, Sparkles } from "lucide-react"

export function AIDocumentAnalyzer() {
  const { selectedFile, fileContent } = useAppContext()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<{
    summary?: string
    insights?: string
    entities?: string[]
    keywords?: string[]
    sentiment?: string
    readability?: {
      score: number
      level: string
    }
    suggestions?: string[]
    lastAnalyzed?: string
  } | null>(null)
  const [activeTab, setActiveTab] = useState("summary")

  // Load existing analysis when file changes
  useEffect(() => {
    const loadAnalysis = async () => {
      if (!selectedFile) {
        setAnalysisResults(null)
        return
      }

      try {
        const fileMemory = await smartMemoryService.getFileMemory(selectedFile.id)
        if (fileMemory.analysisResults) {
          setAnalysisResults(fileMemory.analysisResults)
        } else {
          setAnalysisResults(null)
        }
      } catch (error) {
        console.error("Error loading analysis:", error)
        setAnalysisResults(null)
      }
    }

    loadAnalysis()
  }, [selectedFile])

  // Analyze document
  const analyzeDocument = async () => {
    if (!selectedFile || !fileContent) return

    setIsAnalyzing(true)

    try {
      // In a real implementation, this would call an AI service
      // For now, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate mock analysis results based on file type
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase() || ""
      let mockResults: typeof analysisResults = {
        summary: "",
        insights: "",
        entities: [],
        keywords: [],
        sentiment: "",
        readability: {
          score: 0,
          level: "",
        },
        suggestions: [],
        lastAnalyzed: new Date().toISOString(),
      }

      if (fileExtension === "md" || fileExtension === "markdown") {
        mockResults = {
          summary:
            "This document appears to be a markdown file containing structured content with headings, paragraphs, and possibly lists.",
          insights:
            "The document has a clear structure with proper heading hierarchy. It contains approximately " +
            fileContent.split("\n").length +
            " lines of content.",
          entities: ["Document", "Markdown", "Content", "Structure"],
          keywords: ["markdown", "heading", "content", "structure"],
          sentiment: "Neutral",
          readability: {
            score: 75,
            level: "Good",
          },
          suggestions: [
            "Consider adding a table of contents for longer documents",
            "Use more descriptive headings for better navigation",
            "Add more links to related resources",
          ],
          lastAnalyzed: new Date().toISOString(),
        }
      } else if (fileExtension === "json" || fileExtension === "jsonl" || fileExtension === "jsonb") {
        mockResults = {
          summary: "This is a JSON document containing structured data with nested objects and arrays.",
          insights:
            "The JSON structure appears to be " +
            (fileContent.includes("{") ? "valid" : "potentially invalid") +
            ". It contains approximately " +
            fileContent.split("\n").length +
            " lines of data.",
          entities: ["JSON", "Data", "Structure", "Object"],
          keywords: ["json", "data", "key", "value", "object", "array"],
          sentiment: "Neutral",
          readability: {
            score: 60,
            level: "Moderate",
          },
          suggestions: [
            "Consider adding comments to explain complex data structures",
            "Use consistent naming conventions for properties",
            "Validate against a schema for better reliability",
          ],
          lastAnalyzed: new Date().toISOString(),
        }
      } else if (fileExtension === "yaml" || fileExtension === "yml") {
        mockResults = {
          summary: "This is a YAML configuration file with structured data and possibly nested objects.",
          insights:
            "The YAML structure appears to be organized with proper indentation. It contains approximately " +
            fileContent.split("\n").length +
            " lines of configuration.",
          entities: ["YAML", "Configuration", "Structure", "Settings"],
          keywords: ["yaml", "config", "settings", "environment"],
          sentiment: "Neutral",
          readability: {
            score: 80,
            level: "Good",
          },
          suggestions: [
            "Add more comments to explain configuration options",
            "Group related configuration items together",
            "Consider using anchors for repeated values",
          ],
          lastAnalyzed: new Date().toISOString(),
        }
      } else if (fileExtension === "env" || fileContent.includes("=")) {
        mockResults = {
          summary: "This appears to be an environment configuration file with key-value pairs.",
          insights:
            "The file contains approximately " +
            fileContent.split("\n").filter((line) => line.includes("=")).length +
            " environment variables.",
          entities: ["Environment", "Configuration", "Variables", "Settings"],
          keywords: ["env", "environment", "config", "api", "key"],
          sentiment: "Neutral",
          readability: {
            score: 70,
            level: "Good",
          },
          suggestions: [
            "Add comments to explain sensitive or important variables",
            "Group related variables together",
            "Consider using a naming convention for variables",
          ],
          lastAnalyzed: new Date().toISOString(),
        }
      } else {
        mockResults = {
          summary: "This is a text document with unstructured content.",
          insights: "The document contains approximately " + fileContent.split("\n").length + " lines of text.",
          entities: ["Document", "Text", "Content"],
          keywords: ["text", "document", "content"],
          sentiment: "Neutral",
          readability: {
            score: 65,
            level: "Moderate",
          },
          suggestions: [
            "Consider adding more structure to the document",
            "Break up long paragraphs for better readability",
            "Add headings or sections for better organization",
          ],
          lastAnalyzed: new Date().toISOString(),
        }
      }

      setAnalysisResults(mockResults)

      // Store analysis results in memory
      await smartMemoryService.storeAnalysisResults(selectedFile.id, mockResults)
    } catch (error) {
      console.error("Error analyzing document:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!selectedFile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Select a file to analyze</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Brain className="h-5 w-5 mr-2 text-primary" />
            AI Document Analysis
          </CardTitle>
          <Button size="sm" onClick={analyzeDocument} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="space-y-4 py-8">
            <p className="text-center text-sm text-muted-foreground">Analyzing document...</p>
            <Progress value={45} className="w-full" />
          </div>
        ) : !analysisResults ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <AlertTriangle className="h-12 w-12 text-muted-foreground" />
            <p className="text-center text-muted-foreground">No analysis available for this document</p>
            <p className="text-center text-sm text-muted-foreground">
              Click "Analyze" to generate insights about this document
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">
                  {new Date(analysisResults.lastAnalyzed || "").toLocaleDateString()}
                </Badge>
                <span className="text-xs text-muted-foreground">Last analyzed</span>
              </div>

              {analysisResults.readability && (
                <div className="flex items-center">
                  <span className="text-xs text-muted-foreground mr-2">Readability:</span>
                  <Badge
                    variant={
                      analysisResults.readability.score > 75
                        ? "default"
                        : analysisResults.readability.score > 50
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {analysisResults.readability.level} ({analysisResults.readability.score}/100)
                  </Badge>
                </div>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="summary" className="flex-1">
                  Summary
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex-1">
                  Insights
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="flex-1">
                  Suggestions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Document Summary</h3>
                    <p className="text-sm">{analysisResults.summary}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-2">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResults.keywords?.map((keyword, index) => (
                        <Badge key={index} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Entities</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResults.entities?.map((entity, index) => (
                        <Badge key={index} variant="outline">
                          {entity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Document Insights</h3>
                    <p className="text-sm">{analysisResults.insights}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-2">Sentiment</h3>
                    <Badge variant="outline">{analysisResults.sentiment}</Badge>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="pt-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium mb-2">Improvement Suggestions</h3>
                  <ul className="space-y-2">
                    {analysisResults.suggestions?.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <Lightbulb className="h-4 w-4 mr-2 text-yellow-500 mt-0.5" />
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
