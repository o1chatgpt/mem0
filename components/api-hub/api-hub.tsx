"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Plus,
  Check,
  X,
  Key,
  Globe,
  Database,
  MessageSquare,
  Zap,
  ImageIcon,
  Lock,
  Server,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// API Provider types
type ApiProvider = {
  id: string
  name: string
  description: string
  category: "ai" | "database" | "storage" | "auth" | "other"
  icon: React.ReactNode
  color: string
  fields: ApiField[]
  isConnected: boolean
  isConfigured: boolean
}

type ApiField = {
  name: string
  label: string
  type: "text" | "password" | "url" | "select"
  placeholder?: string
  required: boolean
  options?: { value: string; label: string }[]
}

export default function ApiHub() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [providers, setProviders] = useState<ApiProvider[]>([
    {
      id: "openai",
      name: "OpenAI",
      description: "Connect to GPT models for AI capabilities",
      category: "ai",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "bg-green-500",
      fields: [
        {
          name: "apiKey",
          label: "API Key",
          type: "password",
          placeholder: "sk-...",
          required: true,
        },
        {
          name: "model",
          label: "Default Model",
          type: "select",
          required: true,
          options: [
            { value: "gpt-4o", label: "GPT-4o" },
            { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
            { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
          ],
        },
      ],
      isConnected: true,
      isConfigured: true,
    },
    {
      id: "supabase",
      name: "Supabase",
      description: "Database and authentication services",
      category: "database",
      icon: <Database className="h-5 w-5" />,
      color: "bg-blue-500",
      fields: [
        {
          name: "url",
          label: "Supabase URL",
          type: "url",
          placeholder: "https://your-project.supabase.co",
          required: true,
        },
        {
          name: "anonKey",
          label: "Anon Key",
          type: "password",
          placeholder: "eyJh...",
          required: true,
        },
        {
          name: "serviceKey",
          label: "Service Role Key",
          type: "password",
          placeholder: "eyJh...",
          required: false,
        },
      ],
      isConnected: true,
      isConfigured: true,
    },
    {
      id: "anthropic",
      name: "Anthropic",
      description: "Claude AI models for natural language",
      category: "ai",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "bg-purple-500",
      fields: [
        {
          name: "apiKey",
          label: "API Key",
          type: "password",
          placeholder: "sk-ant-...",
          required: true,
        },
      ],
      isConnected: false,
      isConfigured: false,
    },
    {
      id: "vercel-blob",
      name: "Vercel Blob",
      description: "File storage and CDN services",
      category: "storage",
      icon: <Zap className="h-5 w-5" />,
      color: "bg-yellow-500",
      fields: [
        {
          name: "blobReadWriteToken",
          label: "Blob Read/Write Token",
          type: "password",
          placeholder: "vercel_blob_...",
          required: true,
        },
      ],
      isConnected: true,
      isConfigured: true,
    },
    {
      id: "neon",
      name: "Neon",
      description: "Serverless Postgres database",
      category: "database",
      icon: <Database className="h-5 w-5" />,
      color: "bg-teal-500",
      fields: [
        {
          name: "connectionString",
          label: "Connection String",
          type: "password",
          placeholder: "postgres://...",
          required: true,
        },
      ],
      isConnected: false,
      isConfigured: false,
    },
    {
      id: "auth0",
      name: "Auth0",
      description: "Authentication and authorization platform",
      category: "auth",
      icon: <Lock className="h-5 w-5" />,
      color: "bg-orange-500",
      fields: [
        {
          name: "domain",
          label: "Domain",
          type: "url",
          placeholder: "your-tenant.auth0.com",
          required: true,
        },
        {
          name: "clientId",
          label: "Client ID",
          type: "text",
          required: true,
        },
        {
          name: "clientSecret",
          label: "Client Secret",
          type: "password",
          required: true,
        },
      ],
      isConnected: false,
      isConfigured: false,
    },
    {
      id: "replicate",
      name: "Replicate",
      description: "Run open-source models with a simple API",
      category: "ai",
      icon: <ImageIcon className="h-5 w-5" />,
      color: "bg-indigo-500",
      fields: [
        {
          name: "apiToken",
          label: "API Token",
          type: "password",
          placeholder: "r8_...",
          required: true,
        },
      ],
      isConnected: false,
      isConfigured: false,
    },
    {
      id: "upstash",
      name: "Upstash",
      description: "Serverless Redis and Kafka",
      category: "database",
      icon: <Server className="h-5 w-5" />,
      color: "bg-red-500",
      fields: [
        {
          name: "redisUrl",
          label: "Redis URL",
          type: "url",
          required: true,
        },
        {
          name: "redisToken",
          label: "Redis Token",
          type: "password",
          required: true,
        },
      ],
      isConnected: false,
      isConfigured: false,
    },
  ])
  const [selectedProvider, setSelectedProvider] = useState<ApiProvider | null>(null)
  const [formValues, setFormValues] = useState<Record<string, string>>({})

  // Filter providers based on active tab and search query
  const filteredProviders = providers.filter((provider) => {
    const matchesCategory = activeTab === "all" || provider.category === activeTab
    const matchesSearch =
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Handle provider selection
  const handleSelectProvider = (provider: ApiProvider) => {
    setSelectedProvider(provider)
    // Initialize form values with empty strings
    const initialValues: Record<string, string> = {}
    provider.fields.forEach((field) => {
      initialValues[field.name] = ""
    })
    setFormValues(initialValues)
  }

  // Handle form input changes
  const handleInputChange = (name: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedProvider) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update provider status
      setProviders((prev) =>
        prev.map((p) => (p.id === selectedProvider.id ? { ...p, isConnected: true, isConfigured: true } : p)),
      )

      toast({
        title: "Connection successful",
        description: `${selectedProvider.name} has been successfully connected.`,
      })

      // Reset form and selected provider
      setSelectedProvider(null)
      setFormValues({})
    } catch (error) {
      console.error("Error connecting to provider:", error)
      toast({
        title: "Connection failed",
        description: "Failed to connect to the provider. Please check your credentials.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle provider disconnection
  const handleDisconnect = async (providerId: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update provider status
      setProviders((prev) => prev.map((p) => (p.id === providerId ? { ...p, isConnected: false } : p)))

      toast({
        title: "Disconnected",
        description: "Provider has been disconnected successfully.",
      })
    } catch (error) {
      console.error("Error disconnecting provider:", error)
      toast({
        title: "Disconnection failed",
        description: "Failed to disconnect the provider.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Globe className="mr-2 h-6 w-6 text-primary" />
            API Hub
          </CardTitle>
          <CardDescription>Connect your application to various API providers and services</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedProvider ? (
            <div className="space-y-6">
              <div className="flex items-center">
                <Button variant="ghost" onClick={() => setSelectedProvider(null)} className="mr-2">
                  ← Back
                </Button>
                <h2 className="text-xl font-semibold flex items-center">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${selectedProvider.color} text-white`}
                  >
                    {selectedProvider.icon}
                  </span>
                  {selectedProvider.name}
                </h2>
              </div>

              <div className="space-y-4">
                {selectedProvider.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    {field.type === "select" ? (
                      <select
                        id={field.name}
                        value={formValues[field.name] || ""}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required={field.required}
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formValues[field.name] || ""}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedProvider(null)} className="mr-2">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
                  Connect
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <Input
                  placeholder="Search providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Provider
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="ai">AI</TabsTrigger>
                  <TabsTrigger value="database">Database</TabsTrigger>
                  <TabsTrigger value="storage">Storage</TabsTrigger>
                  <TabsTrigger value="auth">Authentication</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProviders.map((provider) => (
                    <Card key={provider.id} className={provider.isConnected ? "border-green-200" : ""}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md flex items-center justify-between">
                          <div className="flex items-center">
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${provider.color} text-white`}
                            >
                              {provider.icon}
                            </span>
                            {provider.name}
                          </div>
                          {provider.isConnected && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Check className="h-3 w-3 mr-1" /> Connected
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{provider.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{provider.category}</Badge>
                          {provider.isConnected ? (
                            <div className="flex items-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDisconnect(provider.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Disconnect
                              </Button>
                              <Button variant="ghost" size="sm">
                                Configure
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" onClick={() => handleSelectProvider(provider)}>
                              <Plus className="h-4 w-4 mr-1" />
                              Connect
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
