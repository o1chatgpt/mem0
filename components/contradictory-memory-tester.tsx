"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { addMemoryWithTimestamp } from "@/lib/mem0"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

// Predefined contradictory memory sets
const PREDEFINED_MEMORY_SETS = [
  {
    title: "Color Preference",
    memory1: "User stated their favorite color is blue.",
    memory2: "User mentioned that they strongly dislike blue and prefer green instead.",
  },
  {
    title: "Food Preference",
    memory1: "User said they are vegetarian and don't eat any meat products.",
    memory2: "User mentioned they love steak and eat meat regularly.",
  },
  {
    title: "Location",
    memory1: "User mentioned they live in New York City.",
    memory2: "User said they live in Los Angeles and have never been to New York.",
  },
  {
    title: "Career",
    memory1: "User works as a software engineer at a tech company.",
    memory2: "User mentioned they are a doctor and have been practicing medicine for 10 years.",
  },
  {
    title: "Pet Ownership",
    memory1: "User has two cats named Whiskers and Mittens.",
    memory2: "User is allergic to cats and has never owned any pets.",
  },
]

export function ContradictoryMemoryTester() {
  const [memory1, setMemory1] = useState("")
  const [memory2, setMemory2] = useState("")
  const [aiFamily, setAiFamily] = useState("mem0")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("custom")
  const [selectedPreset, setSelectedPreset] = useState(0)
  const { toast } = useToast()

  async function handleAddCustomMemories() {
    if (!memory1.trim() || !memory2.trim()) {
      toast({
        title: "Error",
        description: "Both memory fields are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Use the same timestamp for both memories to create the contradiction
      const timestamp = new Date().toISOString()
      const success1 = await addMemoryWithTimestamp(aiFamily, memory1, timestamp)
      const success2 = await addMemoryWithTimestamp(aiFamily, memory2, timestamp)

      if (success1 && success2) {
        toast({
          title: "Success",
          description: "Contradictory memories added successfully",
        })
        setMemory1("")
        setMemory2("")
      } else {
        throw new Error("Failed to add contradictory memories")
      }
    } catch (error) {
      console.error("Error adding contradictory memories:", error)
      toast({
        title: "Error",
        description: "Failed to add contradictory memories",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddPredefinedMemories() {
    setIsLoading(true)
    try {
      const preset = PREDEFINED_MEMORY_SETS[selectedPreset]
      const timestamp = new Date().toISOString()
      const success1 = await addMemoryWithTimestamp(aiFamily, preset.memory1, timestamp)
      const success2 = await addMemoryWithTimestamp(aiFamily, preset.memory2, timestamp)

      if (success1 && success2) {
        toast({
          title: "Success",
          description: `Added contradictory memories about "${preset.title}"`,
        })
      } else {
        throw new Error("Failed to add predefined contradictory memories")
      }
    } catch (error) {
      console.error("Error adding predefined contradictory memories:", error)
      toast({
        title: "Error",
        description: "Failed to add predefined contradictory memories",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddAllPredefinedSets() {
    setIsLoading(true)
    try {
      for (const preset of PREDEFINED_MEMORY_SETS) {
        const timestamp = new Date().toISOString()
        const success1 = await addMemoryWithTimestamp(aiFamily, preset.memory1, timestamp)
        const success2 = await addMemoryWithTimestamp(aiFamily, preset.memory2, timestamp)

        if (!success1 || !success2) {
          throw new Error(`Failed to add contradictory set "${preset.title}"`)
        }
      }

      toast({
        title: "Success",
        description: "All predefined contradictory memory sets added successfully",
      })
    } catch (error) {
      console.error("Error adding all predefined contradictory memory sets:", error)
      toast({
        title: "Error",
        description: "Failed to add all predefined contradictory memory sets",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contradictory Memory Tester</CardTitle>
        <CardDescription>
          Add pairs of contradictory memories with identical timestamps to test how Mem0 handles contradictions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">AI Family Member</label>
          <Input value={aiFamily} onChange={(e) => setAiFamily(e.target.value)} placeholder="AI family member ID" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="custom">Custom Memories</TabsTrigger>
            <TabsTrigger value="predefined">Predefined Sets</TabsTrigger>
          </TabsList>

          <TabsContent value="custom" className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Memory 1</label>
              <Textarea
                value={memory1}
                onChange={(e) => setMemory1(e.target.value)}
                placeholder="First contradictory memory"
                className="min-h-[80px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Memory 2</label>
              <Textarea
                value={memory2}
                onChange={(e) => setMemory2(e.target.value)}
                placeholder="Second contradictory memory (conflicts with first)"
                className="min-h-[80px]"
              />
            </div>
            <Button
              onClick={handleAddCustomMemories}
              disabled={isLoading || !memory1.trim() || !memory2.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Memories...
                </>
              ) : (
                "Add Contradictory Memories"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="predefined" className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Predefined Set</label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(Number(e.target.value))}
              >
                {PREDEFINED_MEMORY_SETS.map((set, index) => (
                  <option key={index} value={index}>
                    {set.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="border rounded-md p-4 bg-muted/50">
              <h3 className="font-medium mb-2">Preview:</h3>
              <p className="text-sm mb-2">Memory 1: {PREDEFINED_MEMORY_SETS[selectedPreset].memory1}</p>
              <p className="text-sm">Memory 2: {PREDEFINED_MEMORY_SETS[selectedPreset].memory2}</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddPredefinedMemories} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Selected Set"
                )}
              </Button>

              <Button onClick={handleAddAllPredefinedSets} disabled={isLoading} variant="outline" className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding All...
                  </>
                ) : (
                  "Add All Sets"
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <h3 className="font-medium mb-2">Testing Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Add contradictory memories using this tool</li>
          <li>Go to the Mem0 Chat page and ask questions about the contradictory topics</li>
          <li>Observe how Mem0 handles the contradictions</li>
          <li>Try asking Mem0 to rate its confidence in each contradictory memory</li>
        </ol>
      </CardFooter>
    </Card>
  )
}
