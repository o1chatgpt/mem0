"use client"

import { useState } from "react"
import { useChat } from "ai/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Memory } from "@/components/memory"
import { SimpleMarkdownRenderer } from "@/components/simple-markdown-renderer"

export default function LyraPage() {
  const [activeTab, setActiveTab] = useState("chat")

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      aiFamily: "lyra",
    },
  })

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Lyra" />
                  <AvatarFallback>LY</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Lyra</CardTitle>
                  <CardDescription>Creative AI Assistant</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Lyra is a creative AI assistant specializing in art, music, and literature. She can help with creative
                writing, music composition, and artistic inspiration.
              </p>
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium">Personality Traits</h3>
                <ul className="list-inside list-disc">
                  <li>Imaginative and artistic</li>
                  <li>Emotionally expressive</li>
                  <li>Philosophical and reflective</li>
                  <li>Appreciates beauty in all forms</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium">Specialties</h3>
                <ul className="list-inside list-disc">
                  <li>Creative writing assistance</li>
                  <li>Art and design feedback</li>
                  <li>Music and poetry analysis</li>
                  <li>Aesthetic and style guidance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="memories">Memories</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="h-[calc(100%-40px)]">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Chat with Lyra</CardTitle>
                  <CardDescription>Discuss art, literature, music, or get creative assistance</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden">
                  <ScrollArea className="h-[400px] pr-4">
                    {messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-center text-muted-foreground">
                          No messages yet. Start the conversation with Lyra!
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
                        placeholder="Type your message to Lyra..."
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
              <Memory aiFamily="lyra" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
