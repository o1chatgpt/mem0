"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { addMemoryWithTimestamp, addTimeReferencedMemories } from "@/lib/mem0"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Predefined temporal memory sets
const PREDEFINED_TEMPORAL_SETS = [
  {
    title: "Color Preference Evolution",
    memories: [
      {
        memory: "User mentioned their favorite color is blue.",
        timestamp: "2022-01-15T12:00:00Z",
      },
      {
        memory: "User said they're starting to like purple more than blue.",
        timestamp: "2022-06-20T14:30:00Z",
      },
      {
        memory: "User now prefers purple as their favorite color.",
        timestamp: "2023-02-10T09:15:00Z",
      },
      {
        memory: "User mentioned they're exploring green as a new favorite color.",
        timestamp: "2023-11-05T16:45:00Z",
      },
      {
        memory: "User confirmed their favorite color is now green.",
        timestamp: "2024-03-22T10:30:00Z",
      },
    ],
  },
  {
    title: "Diet Changes",
    memories: [
      {
        memory: "User mentioned they eat meat regularly and enjoy steak.",
        timestamp: "2022-03-10T18:20:00Z",
      },
      {
        memory: "User is trying to reduce meat consumption for health reasons.",
        timestamp: "2022-09-15T12:45:00Z",
      },
      {
        memory: "User has become pescatarian and only eats fish, no other meat.",
        timestamp: "2023-04-28T19:30:00Z",
      },
      {
        memory: "User is experimenting with a fully vegetarian diet.",
        timestamp: "2023-12-12T08:15:00Z",
      },
      {
        memory: "User has committed to a vegan lifestyle and avoids all animal products.",
        timestamp: "2024-02-05T14:10:00Z",
      },
    ],
  },
  {
    title: "Location Changes",
    memories: [
      {
        memory: "User lives in New York City and works in Manhattan.",
        timestamp: "2022-02-18T11:30:00Z",
      },
      {
        memory: "User is considering moving to Chicago for a new job opportunity.",
        timestamp: "2022-08-05T15:45:00Z",
      },
      {
        memory: "User has moved to Chicago and is settling into their new apartment.",
        timestamp: "2023-01-20T09:00:00Z",
      },
      {
        memory: "User is working remotely and traveling, currently in Austin, Texas.",
        timestamp: "2023-07-14T16:20:00Z",
      },
      {
        memory: "User has permanently relocated to San Francisco for work.",
        timestamp: "2024-01-08T13:15:00Z",
      },
    ],
  },
]

export function TemporalMemoryTester() {
  const [memory, setMemory] = useState("")
  const [aiFamily, setAiFamily] = useState("mem0")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("custom")
  const [selectedPreset, setSelectedPreset] = useState(0)
  const { toast } = useToast()

  async function handleAddCustomMemoryWithTimestamp() {
    if (!memory.trim() || !date) {
      toast({
        title: "Error",
        description: "Both memory and date are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const timestamp = date.toISOString()
      const success = await addMemoryWithTimestamp(aiFamily, memory, timestamp)

      if (success) {
        toast({
          title: "Success",
          description: "Memory added with timestamp successfully",
        })
        setMemory("")
      } else {
        throw new Error("Failed to add memory with timestamp")
      }
    } catch (error) {
      console.error("Error adding memory with timestamp:", error)
      toast({
        title: "Error",
        description: "Failed to add memory with timestamp",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddPredefinedTemporalSet() {
    setIsLoading(true)
    try {
      const preset = PREDEFINED_TEMPORAL_SETS[selectedPreset]
      const success = await addTimeReferencedMemories(aiFamily, preset.memories)

      if (success) {
        toast({
          title: "Success",
          description: `Added temporal memory set "${preset.title}"`,
        })
      } else {
        throw new Error("Failed to add predefined temporal memories")
      }
    } catch (error) {
      console.error("Error adding predefined temporal memories:", error)
      toast({
        title: "Error",
        description: "Failed to add predefined temporal memories",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddAllTemporalSets() {
    setIsLoading(true)
    try {
      for (const preset of PREDEFINED_TEMPORAL_SETS) {
        const success = await addTimeReferencedMemories(aiFamily, preset.memories)
        if (!success) {
          throw new Error(`Failed to add temporal set "${preset.title}"`)
        }
      }

      toast({
        title: "Success",
        description: "All temporal memory sets added successfully",
      })
    } catch (error) {
      console.error("Error adding all temporal memory sets:", error)
      toast({
        title: "Error",
        description: "Failed to add all temporal memory sets",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temporal Memory Tester</CardTitle>
        <CardDescription>
          Add memories with specific timestamps to test how Mem0 handles questions about changes over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">AI Family Member</label>
          <Input value={aiFamily} onChange={(e) => setAiFamily(e.target.value)} placeholder="AI family member ID" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="custom">Custom Memory</TabsTrigger>
            <TabsTrigger value="predefined">Temporal Sets</TabsTrigger>
          </TabsList>

          <TabsContent value="custom" className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Memory</label>
              <Textarea
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
                placeholder="Memory with timestamp"
                className="min-h-[80px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date & Time</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP HH:mm:ss") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  <div className="p-3 border-t">
                    <Input
                      type="time"
                      step="1"
                      value={date ? format(date, "HH:mm:ss") : ""}
                      onChange={(e) => {
                        if (date && e.target.value) {
                          const [hours, minutes, seconds] = e.target.value.split(":").map(Number)
                          const newDate = new Date(date)
                          newDate.setHours(hours, minutes, seconds || 0)
                          setDate(newDate)
                        }
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Button
              onClick={handleAddCustomMemoryWithTimestamp}
              disabled={isLoading || !memory.trim() || !date}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Memory...
                </>
              ) : (
                "Add Memory with Timestamp"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="predefined" className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Temporal Memory Set</label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(Number(e.target.value))}
              >
                {PREDEFINED_TEMPORAL_SETS.map((set, index) => (
                  <option key={index} value={index}>
                    {set.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="border rounded-md p-4 bg-muted/50 max-h-[200px] overflow-auto">
              <h3 className="font-medium mb-2">Timeline Preview:</h3>
              {PREDEFINED_TEMPORAL_SETS[selectedPreset].memories.map((mem, index) => (
                <div key={index} className="mb-2 pb-2 border-b last:border-0">
                  <p className="text-sm font-medium">
                    {new Date(mem.timestamp).toLocaleDateString()} ({format(new Date(mem.timestamp), "PP")})
                  </p>
                  <p className="text-sm">{mem.memory}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddPredefinedTemporalSet} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Selected Set"
                )}
              </Button>

              <Button onClick={handleAddAllTemporalSets} disabled={isLoading} variant="outline" className="flex-1">
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
        <h3 className="font-medium mb-2">Suggested Temporal Questions:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>How has my favorite color changed over time?</li>
          <li>What was my diet like in 2022 compared to now?</li>
          <li>Where did I live in 2023?</li>
          <li>When did I move to Chicago?</li>
          <li>How has my diet evolved since 2022?</li>
        </ul>
      </CardFooter>
    </Card>
  )
}
