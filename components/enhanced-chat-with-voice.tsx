"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Send,
  RefreshCw,
  User,
  Paperclip,
  X,
  FileText,
  ImageIcon,
  Sparkles,
  Wand2,
  Volume2,
  VolumeX,
  Settings,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { AIFamilyMember } from "@/data/ai-family-members"
import { useToast } from "@/hooks/use-toast"
import { useAIVoice } from "@/hooks/use-ai-voice"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  attachments?: {
    type: "file" | "image"
    name: string
    url: string
  }[]
}

interface EnhancedChatWithVoiceProps {
  member: AIFamilyMember
  initialMessages?: Message[]
  apiKey?: string
  elevenlabsApiKey?: string
  onSaveConversation?: (messages: Message[]) => void
}

export function EnhancedChatWithVoice({
  member,
  initialMessages = [],
  apiKey,
  elevenlabsApiKey: propElevenlabsApiKey,
  onSaveConversation,
}: EnhancedChatWithVoiceProps) {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.length > 0
      ? initialMessages
      : [
          {
            id: "welcome",
            role: "assistant",
            content: `Hello! I'm ${member.name}, your AI assistant specialized in ${member.specialty}. How can I help you today?`,
            timestamp: new Date(),
          },
        ],
  )
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([
    "Tell me more about your capabilities",
    `How can you help me with ${member.specialty}?`,
    "What kind of tasks can you assist with?",
  ])
  const [elevenlabsApiKey, setElevenlabsApiKey] = useState<string | undefined>(propElevenlabsApiKey)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [hasCheckedLocalStorage, setHasCheckedLocalStorage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Load API key from localStorage if not provided as prop
  useEffect(() => {
    if (!propElevenlabsApiKey) {
      const savedKey = localStorage.getItem("elevenlabs_api_key")
      if (savedKey) {
        setElevenlabsApiKey(savedKey)
        setVoiceEnabled(true)
      }
    } else {
      setVoiceEnabled(true)
    }
    setHasCheckedLocalStorage(true)
  }, [propElevenlabsApiKey])

  // Initialize voice hook
  const {
    speak,
    stop,
    isLoading: isVoiceLoading,
    isPlaying,
    error: voiceError,
  } = useAIVoice(member.id, elevenlabsApiKey)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Save conversation when messages change
  useEffect(() => {
    if (messages.length > 1 && onSaveConversation) {
      onSaveConversation(messages)
    }
  }, [messages, onSaveConversation])

  // Handle voice errors
  useEffect(() => {
    if (voiceError) {
      toast({
        title: "Voice Error",
        description: voiceError,
        variant: "destructive",
      })
      // Disable voice if there's an error
      setVoiceEnabled(false)
    }
  }, [voiceError, toast])

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && attachments.length === 0) || isLoading) return

    // Create a new user message
    const userMessageId = Date.now().toString()
    const userAttachments = attachments.map((file) => ({
      type: file.type.startsWith("image/") ? ("image" as const) : ("file" as const),
      name: file.name,
      url: URL.createObjectURL(file),
    }))

    const userMessage: Message = {
      id: userMessageId,
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
      attachments: userAttachments.length > 0 ? userAttachments : undefined,
    }

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setAttachments([])
    setIsLoading(true)

    try {
      // In a real implementation, you would call the OpenAI API here
      // For now, we'll use a simpler approach
      let responseContent = ""

      if (apiKey) {
        // If we have an API key, attempt to get a real response
        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [
                {
                  role: "system",
                  content: `You are ${member.name}, an AI assistant specialized in ${member.specialty}. ${member.systemPrompt}`,
                },
                ...messages.map((m) => ({
                  role: m.role,
                  content: m.content,
                })),
                {
                  role: "user",
                  content: inputMessage,
                },
              ],
              apiKey: apiKey,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            responseContent = data.content
          } else {
            throw new Error("Failed to get AI response")
          }
        } catch (error) {
          console.error("Error getting AI response:", error)
          // Fallback to simulated response
          responseContent = `As ${member.name}, I would respond to your question about "${inputMessage.substring(
            0,
            30,
          )}${inputMessage.length > 30 ? "..." : ""}" with insights from my expertise in ${member.specialty}.`
        }
      } else {
        // No API key, use simulated response
        responseContent = `As ${member.name}, I would respond to your question about "${inputMessage.substring(0, 30)}${
          inputMessage.length > 30 ? "..." : ""
        }" with insights from my expertise in ${member.specialty}.`
      }

      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      }

      // Add assistant message to chat
      setMessages((prev) => [...prev, assistantMessage])

      // Speak the response if voice is enabled
      if (voiceEnabled && elevenlabsApiKey) {
        speak(responseContent)
      }

      // Generate new contextual suggestions
      setSuggestions([
        "Tell me more about " + member.specialty,
        "How would you approach this problem?",
        "Can you provide examples?",
      ])
    } catch (error) {
      console.error("Error generating response:", error)
      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setAttachments((prev) => [...prev, ...newFiles])

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleEnhanceMessage = () => {
    if (!inputMessage.trim()) return

    setInputMessage(
      (prev) => `${prev}\n\nPlease provide a detailed, well-structured response with examples and actionable insights.`,
    )
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
  }

  const toggleVoice = () => {
    if (isPlaying) {
      stop()
    }
    setVoiceEnabled(!voiceEnabled)
  }

  const handleSpeakMessage = (content: string) => {
    if (voiceEnabled && elevenlabsApiKey) {
      if (isPlaying) {
        stop()
      } else {
        speak(content)
      }
    }
  }

  if (!hasCheckedLocalStorage) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="py-3 px-4 border-b flex flex-row justify-between items-center">
          <CardTitle className="text-base font-medium">Chat with {member.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="voice-toggle" className="text-xs">
              Voice
            </Label>
            {elevenlabsApiKey ? (
              <Switch id="voice-toggle" checked={voiceEnabled} onCheckedChange={toggleVoice} />
            ) : (
              <div className="flex items-center gap-2">
                <Switch id="voice-toggle" disabled />
                <Link href="/settings/voice">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Configure voice settings">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {!elevenlabsApiKey && (
            <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 p-3 rounded-md text-sm flex items-start gap-2 mb-4">
              <div className="mt-0.5">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Voice feature is disabled</p>
                <p className="text-xs mt-1">
                  To enable voice, you need to{" "}
                  <Link href="/settings/voice" className="underline font-medium">
                    add your ElevenLabs API key
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-3 rounded-lg p-3",
                message.role === "user"
                  ? "bg-muted/50 ml-auto max-w-[80%]"
                  : message.role === "system"
                    ? "bg-yellow-100/50 dark:bg-yellow-900/20 max-w-[80%]"
                    : "bg-primary/10 mr-auto max-w-[80%]",
              )}
            >
              {message.role === "assistant" ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback style={{ backgroundColor: `${member.color}20`, color: member.color }}>
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ) : message.role === "system" ? (
                <Avatar className="h-8 w-8 bg-yellow-500">
                  <Wand2 className="h-4 w-4 text-white" />
                </Avatar>
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <User className="h-4 w-4" />
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm font-medium mb-1 flex items-center justify-between">
                  <span>{message.role === "user" ? "You" : message.role === "system" ? "System" : member.name}</span>

                  {message.role === "assistant" && elevenlabsApiKey && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleSpeakMessage(message.content)}
                      disabled={isVoiceLoading || !voiceEnabled}
                    >
                      {isPlaying && message.id === messages[messages.length - 1].id ? (
                        <VolumeX className="h-3 w-3" />
                      ) : (
                        <Volume2 className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>

                {/* Render attachments if any */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.attachments.map((attachment, index) => (
                      <div key={index} className="border rounded-md p-2 bg-background flex items-center gap-2 text-xs">
                        {attachment.type === "image" ? (
                          <>
                            <ImageIcon className="h-4 w-4 text-blue-500" />
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {attachment.name}
                            </a>
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 text-blue-500" />
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {attachment.name}
                            </a>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center justify-center text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              <span>{member.name} is thinking...</span>
            </div>
          )}
          {isVoiceLoading && (
            <div className="flex items-center justify-center text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              <span>Generating voice...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Suggestions */}
      <div className="flex gap-2 overflow-x-auto py-2 px-1">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="whitespace-nowrap text-xs"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border-t">
          {attachments.map((file, index) => (
            <div key={index} className="border rounded-md p-2 bg-muted flex items-center gap-2 text-xs">
              {file.type.startsWith("image/") ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              <span className="truncate max-w-[150px]">{file.name}</span>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleRemoveAttachment(index)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t flex flex-col gap-2">
        <div className="flex gap-2 items-end">
          <div className="relative flex-1">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${member.name}...`}
              className="min-h-[80px] pr-10 resize-none"
              disabled={isLoading}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6 opacity-70 hover:opacity-100"
              onClick={handleEnhanceMessage}
              disabled={!inputMessage.trim()}
              title="Enhance message"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple />
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button
              className="h-10"
              onClick={handleSendMessage}
              disabled={(!inputMessage.trim() && attachments.length === 0) || isLoading}
            >
              <Send className="h-5 w-5 mr-1" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
