"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Beaker, FlaskConical } from "lucide-react"
import Link from "next/link"
import { CreateTestDialog } from "@/components/ab-testing/create-test-dialog"
import { TestsList } from "@/components/ab-testing/tests-list"
import { TestResults } from "@/components/ab-testing/test-results"
import { ActiveTestsOverview } from "@/components/ab-testing/active-tests-overview"

export default function TemplateABTesting() {
  const [activeTab, setActiveTab] = useState("active")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [tests, setTests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null)

  // Fetch tests data
  useEffect(() => {
    const fetchTests = async () => {
      setIsLoading(true)

      // In a real implementation, this would be an API call to fetch actual data
      // For now, we'll simulate a delay and return mock data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data for multivariate tests
      const mockTests = generateMockTests()
      setTests(mockTests)

      if (mockTests.length > 0 && !selectedTestId) {
        setSelectedTestId(mockTests[0].id)
      }

      setIsLoading(false)
    }

    fetchTests()
  }, [])

  const handleCreateTest = (newTest: any) => {
    // In a real implementation, this would make an API call to create the test
    const testWithId = {
      ...newTest,
      id: `test-${Date.now()}`,
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      metrics: generateInitialMetrics(Object.keys(newTest.variations)),
      dailyData: [],
    }

    setTests([testWithId, ...tests])
    setSelectedTestId(testWithId.id)
    setActiveTab("active")
  }

  const handleStopTest = (testId: string) => {
    setTests(tests.map((test) => (test.id === testId ? { ...test, status: "completed", endDate: new Date() } : test)))
  }

  const handleDeleteTest = (testId: string) => {
    setTests(tests.filter((test) => test.id !== testId))
    if (selectedTestId === testId) {
      setSelectedTestId(tests.length > 1 ? tests.find((t) => t.id !== testId)?.id || null : null)
    }
  }

  const activeTests = tests.filter((test) => test.status === "active")
  const completedTests = tests.filter((test) => test.status === "completed")

  const selectedTest = tests.find((test) => test.id === selectedTestId)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/template-analytics">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Analytics
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center">
            <FlaskConical className="mr-2 h-6 w-6" />
            Template Testing
          </h1>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Test
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Beaker className="mr-2 h-5 w-5" />
                Test Variations
              </CardTitle>
              <CardDescription>Compare multiple template variations to see which performs best</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="active" className="flex items-center">
                    Active ({activeTests.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex items-center">
                    Completed ({completedTests.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="p-0 m-0">
                  <TestsList
                    tests={activeTests}
                    selectedTestId={selectedTestId}
                    onSelectTest={setSelectedTestId}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent value="completed" className="p-0 m-0">
                  <TestsList
                    tests={completedTests}
                    selectedTestId={selectedTestId}
                    onSelectTest={setSelectedTestId}
                    isLoading={isLoading}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center border-t p-4">
              <Button variant="outline" size="sm" className="w-full" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Test
              </Button>
            </CardFooter>
          </Card>

          <ActiveTestsOverview tests={activeTests} isLoading={isLoading} />
        </div>

        <div className="md:col-span-2">
          {selectedTest ? (
            <TestResults test={selectedTest} onStopTest={handleStopTest} onDeleteTest={handleDeleteTest} />
          ) : (
            <Card className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Test Selected</h3>
                <p className="text-muted-foreground mt-2">
                  Select a test from the list or create a new one to view results
                </p>
                <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Test
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <CreateTestDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreateTest={handleCreateTest}
      />
    </div>
  )
}

// Helper function to generate initial metrics for a new test
function generateInitialMetrics(variationKeys: string[]) {
  const metrics = {
    impressions: {},
    usageCount: {},
    effectiveness: {},
    responseTime: {},
    userSatisfaction: {},
  }

  variationKeys.forEach((key) => {
    metrics.impressions[key] = 0
    metrics.usageCount[key] = 0
    metrics.effectiveness[key] = 0
    metrics.responseTime[key] = 0
    metrics.userSatisfaction[key] = 0
  })

  return metrics
}

// Helper function to generate mock multivariate tests
function generateMockTests() {
  const templateNames = ["Research Assistant", "Creative Writing Coach", "File Organizer", "Technical Advisor"]

  const generateMetrics = (variationKeys: string[], daysRunning: number, effectiveness: number) => {
    // Generate more realistic metrics based on how long the test has been running
    const metrics = {
      impressions: {},
      usageCount: {},
      effectiveness: {},
      responseTime: {},
      userSatisfaction: {},
    }

    // Base values for variation A
    const baseImpressions = Math.floor(Math.random() * 50) + 50
    const impressionsA = baseImpressions * daysRunning
    const conversionRateA = Math.random() * 0.3 + 0.4 // 40-70%
    const usageCountA = Math.floor(impressionsA * conversionRateA)
    const effectivenessA = effectiveness
    const responseTimeA = Math.floor(Math.random() * 1000) + 500
    const userSatisfactionA = Math.floor(Math.random() * 20) + 70

    // Set values for variation A
    metrics.impressions["A"] = impressionsA
    metrics.usageCount["A"] = usageCountA
    metrics.effectiveness["A"] = effectivenessA
    metrics.responseTime["A"] = responseTimeA
    metrics.userSatisfaction["A"] = userSatisfactionA

    // Generate values for other variations
    variationKeys
      .filter((key) => key !== "A")
      .forEach((key) => {
        // Each variation has slightly different performance
        const variationFactor = Math.random() * 0.4 + 0.8 // 80-120% of A
        const impressions = Math.floor(impressionsA * (Math.random() * 0.4 + 0.8))
        const conversionRate = conversionRateA * (Math.random() * 0.5 + 0.8)
        const usageCount = Math.floor(impressions * conversionRate)
        const effectiveness = effectivenessA * variationFactor
        const responseTime = responseTimeA * (Math.random() * 0.5 + 0.75)
        const userSatisfaction = userSatisfactionA * (Math.random() * 0.3 + 0.9)

        metrics.impressions[key] = impressions
        metrics.usageCount[key] = usageCount
        metrics.effectiveness[key] = effectiveness
        metrics.responseTime[key] = responseTime
        metrics.userSatisfaction[key] = userSatisfaction
      })

    return metrics
  }

  const generateDailyData = (variationKeys: string[], startDate: Date, endDate: Date, metrics: any) => {
    const days = []
    const currentDate = new Date(startDate)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))

    // Calculate daily increments for each variation
    const dailyIncrements = {}
    const cumulativeValues = {}

    variationKeys.forEach((key) => {
      dailyIncrements[key] = metrics.impressions[key] / totalDays
      cumulativeValues[key] = 0
    })

    while (currentDate <= endDate) {
      const dailyData = {
        date: new Date(currentDate),
        impressions: {},
        cumulative: {},
      }

      // Add data for each variation
      variationKeys.forEach((key) => {
        // Add some randomness to daily numbers
        const randomFactor = Math.random() * 0.5 + 0.75 // 75-125%
        const daily = Math.floor(dailyIncrements[key] * randomFactor)

        cumulativeValues[key] += daily

        dailyData.impressions[key] = daily
        dailyData.cumulative[key] = cumulativeValues[key]
      })

      days.push(dailyData)
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  // Generate mock tests
  return [
    // Active tests with multiple variations
    {
      id: "test-1",
      name: "Improved Research Template",
      description: "Testing multiple variations of research templates with different structures",
      templateName: templateNames[0],
      status: "active",
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
      variations: {
        A: {
          name: "Original",
          description: "Current research template",
          template: "You are a research assistant helping with academic research...",
        },
        B: {
          name: "Structured Format",
          description: "More structured format with clear sections",
          template:
            "You are a research assistant with expertise in academic research. Follow this structure:\n\n1. Background Information\n2. Key Findings\n3. Analysis\n4. Recommendations",
        },
        C: {
          name: "Question-Based",
          description: "Template that uses guiding questions",
          template:
            "You are a research assistant helping with academic research. Address these questions in your response:\n\n- What is the main topic?\n- What are the key findings?\n- How does this relate to existing research?\n- What are the implications?",
        },
      },
      metrics: generateMetrics(["A", "B", "C"], 5, 75),
      dailyData: generateDailyData(
        ["A", "B", "C"],
        new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        new Date(),
        generateMetrics(["A", "B", "C"], 5, 75),
      ),
    },
    {
      id: "test-2",
      name: "Technical Advisor Approaches",
      description: "Testing different approaches to technical explanations",
      templateName: templateNames[3],
      status: "active",
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
      variations: {
        A: {
          name: "Technical",
          description: "Detailed technical explanations",
          template:
            "You are a technical advisor with deep expertise. Provide detailed technical explanations with proper terminology...",
        },
        B: {
          name: "Simplified",
          description: "Simplified explanations with analogies",
          template:
            "You are a technical advisor who excels at making complex topics simple. Use analogies and simplified explanations...",
        },
        C: {
          name: "Step-by-Step",
          description: "Procedural explanations with numbered steps",
          template:
            "You are a technical advisor who provides clear step-by-step instructions. Break down complex processes into numbered steps...",
        },
        D: {
          name: "Visual-Focused",
          description: "Explanations that emphasize visual descriptions",
          template:
            "You are a technical advisor who uses visual descriptions. Describe processes in terms of visual elements and spatial relationships...",
        },
      },
      metrics: generateMetrics(["A", "B", "C", "D"], 2, 82),
      dailyData: generateDailyData(
        ["A", "B", "C", "D"],
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        new Date(),
        generateMetrics(["A", "B", "C", "D"], 2, 82),
      ),
    },

    // Completed tests
    {
      id: "test-3",
      name: "Creative Writing Prompt Styles",
      description: "Testing different prompt styles for creative writing",
      templateName: templateNames[1],
      status: "completed",
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      variations: {
        A: {
          name: "Open-ended",
          description: "Open-ended creative prompts",
          template: "You are a creative writing coach. Provide open-ended prompts that inspire creativity...",
        },
        B: {
          name: "Structured",
          description: "Structured creative prompts with constraints",
          template:
            "You are a creative writing coach. Provide structured prompts with specific constraints to guide creativity...",
        },
        C: {
          name: "Character-focused",
          description: "Prompts that focus on character development",
          template:
            "You are a creative writing coach specializing in character development. Provide prompts that help writers develop complex characters...",
        },
      },
      metrics: generateMetrics(["A", "B", "C"], 13, 88),
      dailyData: generateDailyData(
        ["A", "B", "C"],
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        generateMetrics(["A", "B", "C"], 13, 88),
      ),
      winner: "B",
      conclusion:
        "The structured creative prompts (B) performed significantly better with 23% higher user satisfaction and 18% more usage. Users found the constraints helpful for focusing their creativity.",
    },
  ]
}
