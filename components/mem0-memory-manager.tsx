"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  addMemoryWithEmbedding,
  getMemories,
  searchMemoriesBySimilarity,
  deleteMemory,
  type MemoryEntry,
} from "@/services/vector-store"
import {
  Trash2,
  Search,
  Plus,
  RefreshCw,
  Database,
  Lightbulb,
  Layout,
  MessageSquare,
  Palette,
  Smartphone,
  Laptop,
} from "lucide-react"

// Example preference memories
const EXAMPLE_PREFERENCES = [
  "I prefer dark mode interfaces in applications.",
  "I like concise explanations with practical examples.",
  "I prefer bullet points for lists of information.",
  "I appreciate when technical concepts are explained with analogies.",
  "I prefer a conversational tone in communications.",
  "I like seeing code examples when learning programming concepts.",
  "I prefer visual explanations with diagrams when possible.",
  "I like receiving step-by-step instructions for complex tasks.",
  "I prefer minimalist UI designs with clean layouts.",
  "I appreciate when you check my understanding before moving to new topics.",
]

// Example UI design preferences
const UI_DESIGN_PREFERENCES = [
  // Basic UI preferences
  "I prefer minimalist interfaces with plenty of white space.",
  "I prefer dark mode interfaces to reduce eye strain.",
  "I like interfaces with rounded corners and soft shadows.",
  "I prefer a color scheme based on blues and teals.",
  "I like interfaces with clear visual hierarchy and distinct sections.",
  "I prefer card-based layouts for organizing related information.",
  "I like interfaces with subtle animations for feedback.",
  "I prefer larger text and buttons for better readability.",
  "I like interfaces with consistent padding and alignment.",
  "I prefer interfaces that use icons alongside text for better comprehension.",

  // Advanced UI preferences
  "I prefer interfaces that use a 12-column grid system for layout.",
  "I like when interactive elements have hover states that provide feedback.",
  "I prefer when form fields have clear validation feedback.",
  "I like when error messages appear inline rather than as popups.",
  "I prefer when modals have a subtle backdrop blur effect.",
  "I like when scrollbars are styled to match the interface theme.",
  "I prefer when tables have zebra striping for better readability.",
  "I like when buttons have a slight elevation or shadow to appear clickable.",
  "I prefer when dropdown menus have a subtle entrance animation.",
  "I like when the primary action button stands out with a contrasting color.",
]

// Example responsive design preferences
const RESPONSIVE_DESIGN_PREFERENCES = [
  "I prefer interfaces that adapt well to both desktop and mobile.",
  "I like when mobile interfaces use bottom navigation for easy thumb access.",
  "I prefer when tables collapse into cards on mobile screens.",
  "I like when images are optimized for different screen sizes.",
  "I prefer when font sizes increase slightly on larger screens.",
  "I like when interfaces use a single-column layout on mobile devices.",
  "I prefer when touch targets are at least 44px in size on mobile.",
  "I like when forms stack vertically on mobile screens.",
  "I prefer when sidebar navigation converts to a hamburger menu on mobile.",
  "I like when content maintains readability across all device sizes.",
]

// Example accessibility preferences
const ACCESSIBILITY_PREFERENCES = [
  "I prefer interfaces with high contrast between text and background.",
  "I like when interfaces support keyboard navigation.",
  "I prefer when images have descriptive alt text.",
  "I like when interfaces work well with screen readers.",
  "I prefer when interactive elements have visible focus states.",
  "I like when color is not the only way to convey information.",
  "I prefer when text is resizable without breaking the layout.",
  "I like when videos have captions or transcripts.",
  "I prefer when forms have clear error messages and instructions.",
  "I like when interfaces support reduced motion for users with vestibular disorders.",
]

// Example communication style preferences
const COMMUNICATION_PREFERENCES = [
  "I prefer direct and straightforward communication.",
  "I appreciate a friendly, conversational tone.",
  "I like detailed explanations with examples.",
  "I prefer concise responses that get to the point quickly.",
  "I appreciate when complex ideas are broken down into simpler parts.",
  "I like when you use analogies to explain technical concepts.",
  "I prefer when you check my understanding before moving on.",
  "I appreciate when you provide multiple perspectives on a topic.",
  "I like when you use bullet points for lists and steps.",
  "I prefer when you highlight key takeaways at the end of explanations.",
]

export function Mem0MemoryManager({ aiFamily = "mem0" }: { aiFamily?: string }) {
  const [memories, setMemories] = useState<MemoryEntry[]>([])
  const [newMemory, setNewMemory] = useState("")
  const [newMemoryCategory, setNewMemoryCategory] = useState("preference")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [memoryCount, setMemoryCount] = useState(0)
  const [categoryTab, setCategoryTab] = useState("custom")
  const [preferenceType, setPreferenceType] = useState("general")
  const [uiPreferenceType, setUiPreferenceType] = useState("basic")
  const { toast } = useToast()

  useEffect(() => {
    fetchMemories()
    fetchMemoryCount()
  }, [aiFamily])

  async function fetchMemoryCount() {
    try {
      const response = await fetch(`/api/memory-count?aiFamily=${aiFamily}`)
      const data = await response.json()
      if (data.success) {
        setMemoryCount(data.count)
      }
    } catch (error) {
      console.error("Error fetching memory count:", error)
    }
  }

  async function fetchMemories() {
    setIsLoading(true)
    try {
      const data = await getMemories(aiFamily, 50)
      setMemories(data)
    } catch (error) {
      console.error("Error fetching memories:", error)
      toast({
        title: "Error",
        description: "Failed to load memories",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddMemory() {
    if (!newMemory.trim()) return

    setIsLoading(true)
    try {
      // Format the memory with a category prefix
      const formattedMemory = `[${newMemoryCategory}] ${newMemory}`

      const success = await addMemoryWithEmbedding({
        ai_family_member_id: aiFamily,
        user_id: "00000000-0000-0000-0000-000000000000", // Default user ID
        memory: formattedMemory,
      })

      if (success) {
        setNewMemory("")
        fetchMemories()
        fetchMemoryCount()
        toast({
          title: "Success",
          description: "Memory added successfully",
        })
      } else {
        throw new Error("Failed to add memory")
      }
    } catch (error) {
      console.error("Error adding memory:", error)
      toast({
        title: "Error",
        description: "Failed to add memory",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      fetchMemories()
      return
    }

    setIsSearching(true)
    try {
      if (searchQuery.length > 3) {
        // Use vector similarity search for longer queries
        const data = await searchMemoriesBySimilarity(aiFamily, searchQuery)
        setMemories(data)
      } else {
        // Use simple text search for short queries
        const data = await getMemories(aiFamily)
        const filtered = data.filter((memory) => memory.memory.toLowerCase().includes(searchQuery.toLowerCase()))
        setMemories(filtered)
      }
    } catch (error) {
      console.error("Error searching memories:", error)
      toast({
        title: "Error",
        description: "Failed to search memories",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  async function handleDeleteMemory(id: string) {
    if (!id) return

    setIsDeleting(true)
    try {
      const success = await deleteMemory(id)

      if (success) {
        setMemories(memories.filter((memory) => memory.id !== id))
        fetchMemoryCount()
        toast({
          title: "Success",
          description: "Memory deleted successfully",
        })
      } else {
        throw new Error("Failed to delete memory")
      }
    } catch (error) {
      console.error("Error deleting memory:", error)
      toast({
        title: "Error",
        description: "Failed to delete memory",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Function to get memory category from memory string
  function getMemoryCategory(memory: string): string {
    const match = memory.match(/^\[(.*?)\]/)
    return match ? match[1] : "other"
  }

  // Function to get memory content without category prefix
  function getMemoryContent(memory: string): string {
    return memory.replace(/^\[(.*?)\]\s*/, "")
  }

  // Filter memories based on active tab
  const filteredMemories = memories.filter((memory) => {
    if (activeTab === "all") return true
    return getMemoryCategory(memory.memory).toLowerCase() === activeTab.toLowerCase()
  })

  // Function to add example preference
  function addExamplePreference(preference: string) {
    setNewMemory(preference)
    setNewMemoryCategory("preference")
  }

  // Get the appropriate example preferences based on the preference type
  function getExamplePreferences() {
    switch (preferenceType) {
      case "ui":
        if (uiPreferenceType === "responsive") {
          return RESPONSIVE_DESIGN_PREFERENCES
        } else if (uiPreferenceType === "accessibility") {
          return ACCESSIBILITY_PREFERENCES
        } else {
          return UI_DESIGN_PREFERENCES
        }
      case "communication":
        return COMMUNICATION_PREFERENCES
      default:
        return EXAMPLE_PREFERENCES
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Mem0 Memory Manager</CardTitle>
            <CardDescription>Add and manage custom memories for Mem0</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            {memoryCount} Memories
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching} size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button onClick={fetchMemories} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="preference">Preferences</TabsTrigger>
            <TabsTrigger value="ui">UI</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-[300px] pr-4">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-muted-foreground">Loading memories...</p>
              </div>
            ) : filteredMemories.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-muted-foreground">
                  {searchQuery ? "No matching memories found" : "No memories yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMemories.map((memory) => (
                  <div key={memory.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className="mb-2">{getMemoryCategory(memory.memory)}</Badge>
                        <p>{getMemoryContent(memory.memory)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMemory(memory.id!)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {new Date(memory.created_at || "").toLocaleString()}
                      </p>
                      {memory.relevance && (
                        <p className="text-xs text-muted-foreground">
                          Relevance: {Math.round(memory.relevance * 100)}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Add Memory Section */}
        <div className="space-y-4">
          <Tabs value={categoryTab} onValueChange={setCategoryTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="custom">Custom Memory</TabsTrigger>
              <TabsTrigger value="examples">Example Preferences</TabsTrigger>
            </TabsList>
            <TabsContent value="custom">
              <div className="flex gap-2 mt-4">
                <div className="w-1/4">
                  <select
                    className="w-full h-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={newMemoryCategory}
                    onChange={(e) => setNewMemoryCategory(e.target.value)}
                  >
                    <option value="preference">Preference</option>
                    <option value="ui">UI</option>
                    <option value="fact">Fact</option>
                    <option value="interest">Interest</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <Textarea
                  placeholder="Add a new memory..."
                  value={newMemory}
                  onChange={(e) => setNewMemory(e.target.value)}
                  className="min-h-[80px] flex-grow"
                />
              </div>
            </TabsContent>
            <TabsContent value="examples">
              <div className="mt-4 space-y-4">
                <Tabs value={preferenceType} onValueChange={setPreferenceType}>
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="general" className="flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" />
                      <span>General</span>
                    </TabsTrigger>
                    <TabsTrigger value="ui" className="flex items-center gap-1">
                      <Layout className="h-3 w-3" />
                      <span>UI Design</span>
                    </TabsTrigger>
                    <TabsTrigger value="communication" className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>Communication</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {preferenceType === "ui" && (
                  <Tabs value={uiPreferenceType} onValueChange={setUiPreferenceType} className="mt-2">
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="basic" className="flex items-center gap-1">
                        <Palette className="h-3 w-3" />
                        <span>Basic UI</span>
                      </TabsTrigger>
                      <TabsTrigger value="responsive" className="flex items-center gap-1">
                        <Smartphone className="h-3 w-3" />
                        <span>Responsive</span>
                      </TabsTrigger>
                      <TabsTrigger value="accessibility" className="flex items-center gap-1">
                        <Laptop className="h-3 w-3" />
                        <span>Accessibility</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}

                <p className="text-sm text-muted-foreground flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Click on an example to use it
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {getExamplePreferences().map((preference, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto py-2 px-3 text-left"
                      onClick={() => addExamplePreference(preference)}
                    >
                      {preference}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={handleAddMemory} disabled={isLoading || !newMemory.trim()} className="w-full" size="lg">
            <Plus className="mr-2 h-4 w-4" /> Add Memory
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <p>
          Add memories about yourself that you want Mem0 to remember. These can be preferences, facts, interests, or
          anything else you'd like Mem0 to know about you.
        </p>
      </CardFooter>
    </Card>
  )
}
