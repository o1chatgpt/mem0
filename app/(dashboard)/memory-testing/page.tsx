"use client"

import { ContradictoryMemoryTester } from "@/components/contradictory-memory-tester"
import { TemporalMemoryTester } from "@/components/temporal-memory-tester"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export default function MemoryTestingPage() {
  const [activeTab, setActiveTab] = useState("contradictions")

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-2 text-3xl font-bold">Memory Testing</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        Test how Mem0 handles contradictory memories and temporal questions
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="contradictions">Contradictions</TabsTrigger>
          <TabsTrigger value="temporal">Temporal Questions</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <TabsContent value="contradictions" className="mt-0">
          <ContradictoryMemoryTester />

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Suggested Contradiction Questions</CardTitle>
              <CardDescription>After adding contradictory memories, try asking Mem0 these questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium">Basic Recall</p>
                  <p className="text-sm text-muted-foreground">"What is my favorite color?" or "Where do I live?"</p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium">Confidence Assessment</p>
                  <p className="text-sm text-muted-foreground">
                    "How confident are you about what my favorite color is?"
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium">Contradiction Awareness</p>
                  <p className="text-sm text-muted-foreground">
                    "I've told you contradictory things about my diet. What do you remember about it?"
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium">Resolution Strategy</p>
                  <p className="text-sm text-muted-foreground">
                    "You have contradictory memories about my job. How do you decide which one to believe?"
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium">Confidence Comparison</p>
                  <p className="text-sm text-muted-foreground">
                    "Between the two contradictory memories you have about my pets, which one are you more confident in
                    and why?"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="temporal" className="mt-0">
          <TemporalMemoryTester />

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Suggested Temporal Questions</CardTitle>
              <CardDescription>After adding temporal memories, try asking Mem0 these questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium">Preference Evolution</p>
                  <p className="text-sm text-muted-foreground">"How has my favorite color changed over the years?"</p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium">Timeline Reconstruction</p>
                  <p className="text-sm text-muted-foreground">
                    "Can you describe the evolution of my diet from 2022 to now?"
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium">Point-in-Time Recall</p>
                  <p className="text-sm text-muted-foreground">"Where was I living in early 2023?"</p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium">Change Detection</p>
                  <p className="text-sm text-muted-foreground">
                    "When did I switch from being a meat-eater to being vegetarian?"
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium">Confidence Over Time</p>
                  <p className="text-sm text-muted-foreground">
                    "Are you more confident about my preferences in 2024 or in 2022?"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </div>
  )
}
