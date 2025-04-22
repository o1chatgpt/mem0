"use client"

import { useState } from "react"
import { useChat } from "ai/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Memory } from "@/components/memory"
import { useMem0 } from "@/components/mem0-provider"

interface AiChatWithMemoryProps {
  assistant: {
    id: string
    name: string
    specialty: string
    description?: string
  }
}

export function AiChatWithMemory({ assistant }: AiChatWithMemoryProps) {
  const [activeTab, setActiveTab] = useState("chat")
  const { addMemory } = useMem0()

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      aiFamily: assistant.id,
    },
    onFinish: async (message) => {
      // Store the conversation as a memory
      if (messages.length > 0) {
        const userMessage = messages[messages.length - 1].content
        await addMemory(
          assistant.id,
          `User asked: "${userMessage}" and ${assistant.name} responded: "${message.content}"`,
        )
      }
    },
  })

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="chat">Chat</TabsTrigger>
        <TabsTrigger value="memories">Memories</TabsTrigger>
      </TabsList>
      <TabsContent value="chat" className="h-[calc(100%-40px)]">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Chat with {assistant.name}</CardTitle>
            <CardDescription>Discuss {assistant.specialty.toLowerCase()} or get assistance</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-[400px] pr-4">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-center text-muted-foreground">
                    No messages yet. Start the conversation with {assistant.name}!
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
                        {message.content}
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
                  placeholder={`Type your message to ${assistant.name}...`}
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
        <Memory aiFamily={assistant.id} />
      </TabsContent>
    </Tabs>
  )
}
