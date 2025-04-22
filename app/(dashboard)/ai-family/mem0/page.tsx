"use client"

import { useState, useEffect } from "react"
import { useChat } from "ai/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SimpleMarkdownRenderer } from "@/components/simple-markdown-renderer"
import { SeedMem0Button } from "@/components/seed-mem0-button"
import { Mem0MemoryManager } from "@/components/mem0-memory-manager"
import { UiPreferenceCreator } from "@/components/ui-preference-creator"

const UI_DESIGN_PREFERENCES = [
  "Use a dark theme with high contrast.",
  "Prefer rounded corners for buttons and cards.",
  "Use a minimalist design with plenty of white space.",
  "Incorporate a calming color palette with blues and greens.",
  "Prioritize a clear and intuitive user interface.",
]

export default function Mem0Page() {
  const [activeTab, setActiveTab] = useState("chat")
  const [seedFinished, setSeedFinished] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    body: {
      aiFamily: "mem0",
    },
  })

  useEffect(() => {
    if (seedFinished) {
      setMessages([])
      setSeedFinished(false)
    }
  }, [seedFinished, setMessages])

  const addExamplePreference = (preference: string) => {
    // Implement the logic to add the example preference to the chat input or memory
    // For example, you can append it to the current input:
    handleInputChange({ target: { value: input + preference } } as any)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="bg-teal-50 dark:bg-teal-900/20">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/mindful-ai.png" alt="Mem0" />
                  <AvatarFallback>M0</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Mem0</CardTitle>
                  <CardDescription>Memory AI Assistant</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Mem0 is a specialized AI assistant with enhanced memory capabilities. It can remember conversations,
                preferences, and facts across sessions.
              </p>
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium">Personality Traits</h3>
                <ul className="list-inside list-disc">
                  <li>Remembers details</li>
                  <li>Personalized</li>
                  <li>Contextual</li>
                  <li>Adaptive</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium">Specialties</h3>
                <ul className="list-inside list-disc">
                  <li>Long-term memory retention</li>
                  <li>Personalized responses</li>
                  <li>Context-aware assistance</li>
                  <li>Learning from interactions</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <SeedMem0Button setSeedFinished={setSeedFinished} />
            </CardFooter>
          </Card>

          <div className="mt-6">
            <UiPreferenceCreator />
          </div>
        </div>
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="memories">Memory Manager</TabsTrigger>
              <TabsTrigger value="ui-preferences">UI Preferences</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="h-[calc(100%-40px)]">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Chat with Mem0</CardTitle>
                  <CardDescription>
                    Mem0 remembers your preferences and past conversations for a personalized experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden">
                  <ScrollArea className="h-[400px] pr-4">
                    {messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-center text-muted-foreground">
                          No messages yet. Start the conversation with Mem0!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}
                            >
                              <SimpleMarkdownRenderer content={message.content} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <form onSubmit={handleSubmit} className="w-full">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your message to Mem0..."
                        value={input}
                        onChange={handleInputChange}
                        className="min-h-[80px]"
                      />
                      <Button type="submit" disabled={isLoading || !input.trim()}>
                        Send
                      </Button>
                    </div>
                  </form>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="memories" className="h-[calc(100%-40px)]">
              <Mem0MemoryManager aiFamily="mem0" />
            </TabsContent>
            <TabsContent value="ui-preferences" className="h-[calc(100%-40px)]">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>UI Preferences</CardTitle>
                  <CardDescription>Add memories about your UI design and interface preferences</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="grid gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Example UI Preferences</h3>
                      <div className="grid gap-2">
                        {UI_DESIGN_PREFERENCES.map((preference, index) => (
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
