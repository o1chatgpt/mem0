"use client"

import { useState, useEffect } from "react"
import { useChat } from "ai/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Memory } from "@/components/memory"
import { SimpleMarkdownRenderer } from "@/components/simple-markdown-renderer"
import { ApiKeyErrorAlert } from "@/components/api-key-error-alert"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, LogIn } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface AiChatInterfaceProps {
  assistant: {
    id: string
    name: string
    specialty: string
    description?: string
  }
}

export function AiChatInterface({ assistant }: AiChatInterfaceProps) {
  const [activeTab, setActiveTab] = useState("chat")
  const [apiKeyError, setApiKeyError] = useState(false)
  const [authError, setAuthError] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClientComponentClient()

  // Check authentication status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Auth error:", error)
          setAuthError(true)
          setIsAuthenticated(false)
        } else {
          setIsAuthenticated(!!data.session)
          setAuthError(!data.session)
        }
      } catch (error) {
        console.error("Failed to check auth:", error)
        setAuthError(true)
        setIsAuthenticated(false)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [supabase])

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    body: {
      aiFamily: assistant.id,
    },
    onError: (error) => {
      console.error("Chat error:", error)
      // Check if it's an authentication error
      if (error.message && error.message.toLowerCase().includes("authentication")) {
        setAuthError(true)
      }
      // Check if it's an API key error
      else if (error.message && error.message.toLowerCase().includes("api key")) {
        setApiKeyError(true)
      }
    },
    // Only enable the chat if the user is authenticated
    enabled: isAuthenticated,
  })

  // Function to handle login redirect
  const handleLogin = () => {
    // Store the current URL to redirect back after login
    if (typeof window !== "undefined") {
      localStorage.setItem("redirectAfterLogin", window.location.pathname)
    }
    // Redirect to login page
    window.location.href = "/login"
  }

  // If still checking authentication, show loading
  if (isCheckingAuth) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Chat with {assistant.name}</CardTitle>
          <CardDescription>Checking authentication status...</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  // If authentication error, show login prompt
  if (authError) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>You need to be logged in to chat with {assistant.name}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              You must be logged in to use the chat feature. Please log in to continue.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center mt-8">
            <Button onClick={handleLogin} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Log In
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

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
            {apiKeyError && (
              <ApiKeyErrorAlert
                title="OpenAI API Key Error"
                description="There was an issue with your OpenAI API key. Please check your configuration in settings."
              />
            )}
            {error && !apiKeyError && !authError && (
              <div className="text-red-500 text-sm mt-2">
                Error: {error.message || "Something went wrong. Please try again."}
              </div>
            )}
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
                  placeholder={`Type your message to ${assistant.name}...`}
                  value={input}
                  onChange={handleInputChange}
                  className="min-h-[80px]"
                  disabled={apiKeyError || isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim() || apiKeyError}>
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
