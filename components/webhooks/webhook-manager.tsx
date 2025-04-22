"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
  Copy,
  Plus,
  Trash,
  RefreshCw,
  Bell,
  Code,
  ExternalLink,
  Clock,
  ArrowDownToLine,
  FileJson,
  Loader2,
} from "lucide-react"
import { createClientComponentClient } from "@/lib/db"

// Types
type Webhook = {
  id: string
  name: string
  endpoint: string
  description: string
  events: string[]
  secret: string
  isActive: boolean
  createdAt: string
  lastTriggered?: string
  successCount: number
  failureCount: number
}

type WebhookEvent = {
  id: string
  webhookId: string
  event: string
  payload: string
  status: "success" | "failure"
  statusCode: number
  timestamp: string
  responseTime: number
}

export default function WebhookManager() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("webhooks")
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false)
  const [newWebhook, setNewWebhook] = useState<Partial<Webhook>>({
    name: "",
    endpoint: "",
    description: "",
    events: [],
    isActive: true,
  })
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null)
  const [availableEvents, setAvailableEvents] = useState([
    { id: "file.created", name: "File Created" },
    { id: "file.updated", name: "File Updated" },
    { id: "file.deleted", name: "File Deleted" },
    { id: "folder.created", name: "Folder Created" },
    { id: "folder.updated", name: "Folder Updated" },
    { id: "folder.deleted", name: "Folder Deleted" },
    { id: "memory.created", name: "Memory Created" },
    { id: "memory.updated", name: "Memory Updated" },
    { id: "memory.deleted", name: "Memory Deleted" },
    { id: "ai.conversation", name: "AI Conversation" },
  ])
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [testPayload, setTestPayload] = useState("")
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null)

  const supabase = createClientComponentClient()

  // Fetch webhooks
  useEffect(() => {
    fetchWebhooks()
    fetchWebhookEvents()
  }, [])

  const fetchWebhooks = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would be a call to your API
      // For now, we'll simulate some data
      await new Promise((resolve) => setTimeout(resolve, 800))

      setWebhooks([
        {
          id: "wh_1",
          name: "File Updates Notification",
          endpoint: "https://example.com/webhooks/files",
          description: "Notifies when files are created, updated or deleted",
          events: ["file.created", "file.updated", "file.deleted"],
          secret: "whsec_abcdefghijklmnopqrstuvwxyz123456",
          isActive: true,
          createdAt: "2023-09-15T10:30:00Z",
          lastTriggered: "2023-09-20T14:22:10Z",
          successCount: 42,
          failureCount: 3,
        },
        {
          id: "wh_2",
          name: "Memory Events",
          endpoint: "https://myapp.com/api/mem0-events",
          description: "Tracks memory creation and updates",
          events: ["memory.created", "memory.updated"],
          secret: "whsec_memory123456789abcdefghijklmnop",
          isActive: true,
          createdAt: "2023-10-05T08:15:00Z",
          lastTriggered: "2023-10-18T11:45:22Z",
          successCount: 28,
          failureCount: 1,
        },
        {
          id: "wh_3",
          name: "AI Conversation Logger",
          endpoint: "https://analytics.mycompany.com/webhooks/ai-logs",
          description: "Logs all AI conversations for analytics",
          events: ["ai.conversation"],
          secret: "whsec_ailogger987654321zyxwvutsrqponm",
          isActive: false,
          createdAt: "2023-08-22T16:40:00Z",
          successCount: 156,
          failureCount: 12,
        },
      ])
    } catch (error) {
      console.error("Error fetching webhooks:", error)
      toast({
        title: "Error",
        description: "Failed to fetch webhooks",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWebhookEvents = async () => {
    try {
      // In a real implementation, this would be a call to your API
      // For now, we'll simulate some data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setWebhookEvents([
        {
          id: "evt_1",
          webhookId: "wh_1",
          event: "file.created",
          payload: JSON.stringify(
            {
              id: "file_123",
              name: "document.pdf",
              size: 1024567,
              mimeType: "application/pdf",
              createdAt: "2023-09-20T14:22:10Z",
            },
            null,
            2,
          ),
          status: "success",
          statusCode: 200,
          timestamp: "2023-09-20T14:22:10Z",
          responseTime: 342,
        },
        {
          id: "evt_2",
          webhookId: "wh_2",
          event: "memory.created",
          payload: JSON.stringify(
            {
              id: "mem_456",
              content: "Meeting with client scheduled for Friday",
              category: "work",
              createdAt: "2023-10-18T11:45:22Z",
            },
            null,
            2,
          ),
          status: "success",
          statusCode: 200,
          timestamp: "2023-10-18T11:45:22Z",
          responseTime: 289,
        },
        {
          id: "evt_3",
          webhookId: "wh_1",
          event: "file.updated",
          payload: JSON.stringify(
            {
              id: "file_123",
              name: "document_v2.pdf",
              size: 1048576,
              mimeType: "application/pdf",
              updatedAt: "2023-09-21T09:15:30Z",
            },
            null,
            2,
          ),
          status: "failure",
          statusCode: 500,
          timestamp: "2023-09-21T09:15:30Z",
          responseTime: 1245,
        },
        {
          id: "evt_4",
          webhookId: "wh_3",
          event: "ai.conversation",
          payload: JSON.stringify(
            {
              id: "conv_789",
              userId: "user_123",
              aiMemberId: "ai_456",
              messages: [
                { role: "user", content: "How do I create a new file?" },
                {
                  role: "assistant",
                  content: "You can create a new file by clicking the 'New File' button in the top right corner.",
                },
              ],
              createdAt: "2023-08-30T13:22:45Z",
            },
            null,
            2,
          ),
          status: "success",
          statusCode: 200,
          timestamp: "2023-08-30T13:22:45Z",
          responseTime: 412,
        },
      ])
    } catch (error) {
      console.error("Error fetching webhook events:", error)
    }
  }

  const handleCreateWebhook = async () => {
    if (!newWebhook.name || !newWebhook.endpoint || selectedEvents.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select at least one event",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // In a real implementation, this would be a call to your API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const webhookSecret = generateWebhookSecret()
      const newWebhookEntry: Webhook = {
        id: `wh_${Date.now()}`,
        name: newWebhook.name || "",
        endpoint: newWebhook.endpoint || "",
        description: newWebhook.description || "",
        events: selectedEvents,
        secret: webhookSecret,
        isActive: true,
        createdAt: new Date().toISOString(),
        successCount: 0,
        failureCount: 0,
      }

      setWebhooks((prev) => [...prev, newWebhookEntry])
      setIsCreatingWebhook(false)
      setNewWebhook({
        name: "",
        endpoint: "",
        description: "",
        events: [],
        isActive: true,
      })
      setSelectedEvents([])

      toast({
        title: "Webhook Created",
        description: "Your webhook has been created successfully",
      })
    } catch (error) {
      console.error("Error creating webhook:", error)
      toast({
        title: "Error",
        description: "Failed to create webhook",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleWebhook = async (webhook: Webhook) => {
    setIsLoading(true)
    try {
      // In a real implementation, this would be a call to your API
      await new Promise((resolve) => setTimeout(resolve, 500))

      setWebhooks((prev) => prev.map((wh) => (wh.id === webhook.id ? { ...wh, isActive: !wh.isActive } : wh)))

      toast({
        title: webhook.isActive ? "Webhook Disabled" : "Webhook Enabled",
        description: `Webhook "${webhook.name}" has been ${webhook.isActive ? "disabled" : "enabled"}`,
      })
    } catch (error) {
      console.error("Error toggling webhook:", error)
      toast({
        title: "Error",
        description: "Failed to update webhook status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteWebhook = async (webhook: Webhook) => {
    setIsLoading(true)
    try {
      // In a real implementation, this would be a call to your API
      await new Promise((resolve) => setTimeout(resolve, 800))

      setWebhooks((prev) => prev.filter((wh) => wh.id !== webhook.id))

      toast({
        title: "Webhook Deleted",
        description: `Webhook "${webhook.name}" has been deleted`,
      })
    } catch (error) {
      console.error("Error deleting webhook:", error)
      toast({
        title: "Error",
        description: "Failed to delete webhook",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerateSecret = async (webhook: Webhook) => {
    setIsLoading(true)
    try {
      // In a real implementation, this would be a call to your API
      await new Promise((resolve) => setTimeout(resolve, 800))

      const newSecret = generateWebhookSecret()

      setWebhooks((prev) => prev.map((wh) => (wh.id === webhook.id ? { ...wh, secret: newSecret } : wh)))

      toast({
        title: "Secret Regenerated",
        description: "Your webhook secret has been regenerated. Make sure to update it in your external service.",
      })
    } catch (error) {
      console.error("Error regenerating secret:", error)
      toast({
        title: "Error",
        description: "Failed to regenerate webhook secret",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestWebhook = async (webhook: Webhook) => {
    setIsLoading(true)
    setTestResult(null)
    try {
      // In a real implementation, this would be a call to your API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate a successful test
      const success = Math.random() > 0.3 // 70% chance of success

      setTestResult({
        success,
        message: success ? "Webhook test completed successfully" : "Webhook test failed",
        details: success
          ? {
              statusCode: 200,
              responseTime: Math.floor(Math.random() * 500) + 100,
              response: { status: "ok", message: "Webhook received" },
            }
          : {
              statusCode: 500,
              responseTime: Math.floor(Math.random() * 1000) + 500,
              error: "Internal Server Error",
            },
      })

      toast({
        title: success ? "Test Successful" : "Test Failed",
        description: success
          ? "Your webhook endpoint responded successfully"
          : "Your webhook endpoint failed to respond correctly",
        variant: success ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error testing webhook:", error)
      setTestResult({
        success: false,
        message: "Failed to send test request",
      })
      toast({
        title: "Error",
        description: "Failed to send test request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateWebhookSecret = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    let result = "whsec_"
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: message,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getEventNameById = (eventId: string) => {
    const event = availableEvents.find((e) => e.id === eventId)
    return event ? event.name : eventId
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Bell className="mr-2 h-6 w-6 text-primary" />
            Webhook Manager
          </CardTitle>
          <CardDescription>Create and manage webhooks to receive data from external services</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="events">Event History</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
            </TabsList>

            <TabsContent value="webhooks">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Your Webhooks</h3>
                <Button onClick={() => setIsCreatingWebhook(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Webhook
                </Button>
              </div>

              {webhooks.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No webhooks yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first webhook to start receiving data from external services.
                  </p>
                  <Button onClick={() => setIsCreatingWebhook(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Webhook
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <Card key={webhook.id} className="border-muted">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg flex items-center">
                              {webhook.name}
                              {webhook.isActive ? (
                                <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>
                              ) : (
                                <Badge variant="outline" className="ml-2">
                                  Inactive
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription>{webhook.description}</CardDescription>
                          </div>
                          <div className="flex items-center">
                            <Switch
                              checked={webhook.isActive}
                              onCheckedChange={() => handleToggleWebhook(webhook)}
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Endpoint URL</Label>
                            <div className="flex items-center mt-1">
                              <code className="bg-muted p-2 rounded text-sm flex-1 truncate">{webhook.endpoint}</code>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(webhook.endpoint, "Endpoint URL copied to clipboard")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Webhook Secret</Label>
                            <div className="flex items-center mt-1">
                              <code className="bg-muted p-2 rounded text-sm flex-1 truncate">
                                {webhook.secret.substring(0, 10)}•••••••••••••••••
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(webhook.secret, "Webhook secret copied to clipboard")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRegenerateSecret(webhook)}
                                disabled={isLoading}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <Label className="text-xs text-muted-foreground">Events</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {webhook.events.map((event) => (
                              <Badge key={event} variant="secondary">
                                {getEventNameById(event)}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <Label className="text-xs text-muted-foreground">Created</Label>
                            <p className="mt-1">{formatDate(webhook.createdAt)}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Last Triggered</Label>
                            <p className="mt-1">
                              {webhook.lastTriggered ? formatDate(webhook.lastTriggered) : "Never"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Success Rate</Label>
                            <p className="mt-1">
                              {webhook.successCount + webhook.failureCount > 0
                                ? `${Math.round((webhook.successCount / (webhook.successCount + webhook.failureCount)) * 100)}%`
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Total Deliveries</Label>
                            <p className="mt-1">{webhook.successCount + webhook.failureCount}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-4">
                        <div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteWebhook(webhook)}
                            disabled={isLoading}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Code className="h-4 w-4 mr-2" />
                                Test
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Test Webhook</DialogTitle>
                                <DialogDescription>Send a test payload to your webhook endpoint.</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label htmlFor="test-event">Event Type</Label>
                                  <Select defaultValue={webhook.events[0]}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select event type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {webhook.events.map((event) => (
                                        <SelectItem key={event} value={event}>
                                          {getEventNameById(event)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="test-payload">Test Payload (JSON)</Label>
                                  <Textarea
                                    id="test-payload"
                                    value={
                                      testPayload ||
                                      JSON.stringify(
                                        {
                                          id: "test_123",
                                          event: webhook.events[0],
                                          timestamp: new Date().toISOString(),
                                          data: {
                                            message: "This is a test webhook payload",
                                          },
                                        },
                                        null,
                                        2,
                                      )
                                    }
                                    onChange={(e) => setTestPayload(e.target.value)}
                                    rows={8}
                                    className="font-mono text-sm"
                                  />
                                </div>

                                {testResult && (
                                  <div className={`p-4 rounded-md ${testResult.success ? "bg-green-50" : "bg-red-50"}`}>
                                    <h4
                                      className={`font-medium ${testResult.success ? "text-green-800" : "text-red-800"}`}
                                    >
                                      {testResult.message}
                                    </h4>
                                    {testResult.details && (
                                      <div className="mt-2">
                                        <p className="text-sm">Status Code: {testResult.details.statusCode}</p>
                                        <p className="text-sm">Response Time: {testResult.details.responseTime}ms</p>
                                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                                          {JSON.stringify(
                                            testResult.details.response || testResult.details.error,
                                            null,
                                            2,
                                          )}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <DialogFooter>
                                <Button onClick={() => handleTestWebhook(webhook)} disabled={isLoading}>
                                  {isLoading ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Testing...
                                    </>
                                  ) : (
                                    <>
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Send Test Webhook
                                    </>
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Button variant="default" size="sm">
                            <ArrowDownToLine className="h-4 w-4 mr-2" />
                            View Logs
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {/* Create Webhook Dialog */}
              <Dialog open={isCreatingWebhook} onOpenChange={setIsCreatingWebhook}>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create Webhook</DialogTitle>
                    <DialogDescription>Create a new webhook to receive data from external services.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="webhook-name" className="text-right">
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="webhook-name"
                          value={newWebhook.name}
                          onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                          placeholder="My Webhook"
                          className="col-span-3"
                        />
                      </div>
                      <div>
                        <Label htmlFor="webhook-endpoint" className="text-right">
                          Endpoint URL <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="webhook-endpoint"
                          value={newWebhook.endpoint}
                          onChange={(e) => setNewWebhook({ ...newWebhook, endpoint: e.target.value })}
                          placeholder="https://example.com/webhook"
                          className="col-span-3"
                        />
                      </div>
                      <div>
                        <Label htmlFor="webhook-description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="webhook-description"
                          value={newWebhook.description}
                          onChange={(e) => setNewWebhook({ ...newWebhook, description: e.target.value })}
                          placeholder="Describe the purpose of this webhook"
                          className="col-span-3"
                        />
                      </div>
                      <div>
                        <Label className="text-right mb-2 block">
                          Events <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {availableEvents.map((event) => (
                            <div key={event.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`event-${event.id}`}
                                checked={selectedEvents.includes(event.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedEvents([...selectedEvents, event.id])
                                  } else {
                                    setSelectedEvents(selectedEvents.filter((id) => id !== event.id))
                                  }
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <Label htmlFor={`event-${event.id}`} className="text-sm font-normal">
                                {event.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreatingWebhook(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateWebhook} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Webhook
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="events">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Event History</h3>
                <div className="flex gap-2">
                  <Input placeholder="Search events..." className="max-w-xs" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failure">Failure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {webhookEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No events yet</h3>
                  <p className="text-muted-foreground">
                    Events will appear here once your webhooks start receiving data.
                  </p>
                </div>
              ) : (
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Webhook</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Response Time</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhookEvents.map((event) => {
                        const webhook = webhooks.find((w) => w.id === event.webhookId)
                        return (
                          <TableRow key={event.id}>
                            <TableCell>
                              <div className="font-medium">{getEventNameById(event.event)}</div>
                              <div className="text-xs text-muted-foreground">{event.event}</div>
                            </TableCell>
                            <TableCell>{webhook?.name || "Unknown"}</TableCell>
                            <TableCell>
                              {event.status === "success" ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                  Success ({event.statusCode})
                                </Badge>
                              ) : (
                                <Badge variant="destructive">Failed ({event.statusCode})</Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(event.timestamp)}</TableCell>
                            <TableCell>{event.responseTime}ms</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedEvent(event)
                                  setShowEventDetails(true)
                                }}
                              >
                                <FileJson className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Event Details Dialog */}
              <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
                <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle>Event Details</DialogTitle>
                    <DialogDescription>
                      {selectedEvent && (
                        <>
                          {getEventNameById(selectedEvent.event)} • {formatDate(selectedEvent.timestamp)}
                        </>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  {selectedEvent && (
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Event Type</Label>
                          <p className="mt-1 font-medium">{getEventNameById(selectedEvent.event)}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Status</Label>
                          <p className="mt-1">
                            {selectedEvent.status === "success" ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                Success ({selectedEvent.statusCode})
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Failed ({selectedEvent.statusCode})</Badge>
                            )}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Timestamp</Label>
                          <p className="mt-1">{formatDate(selectedEvent.timestamp)}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Response Time</Label>
                          <p className="mt-1">{selectedEvent.responseTime}ms</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Payload</Label>
                        <pre className="mt-1 p-4 bg-muted rounded text-xs overflow-auto max-h-80 font-mono">
                          {selectedEvent.payload}
                        </pre>
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (selectedEvent) {
                          copyToClipboard(selectedEvent.payload, "Payload copied to clipboard")
                        }
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Payload
                    </Button>
                    <Button onClick={() => setShowEventDetails(false)}>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="documentation">
              <div className="prose max-w-none dark:prose-invert">
                <h3>Webhook Documentation</h3>
                <p>
                  Webhooks allow external services to be notified when certain events happen in your application. When
                  the specified events occur, we'll send an HTTP POST payload to the webhook's configured URL.
                </p>

                <h4>Setting up a Webhook</h4>
                <ol>
                  <li>Create a new webhook with a name, endpoint URL, and select the events you want to receive.</li>
                  <li>Use the generated webhook secret to validate incoming webhook requests.</li>
                  <li>Test your webhook to ensure it's properly configured.</li>
                </ol>

                <h4>Securing Webhooks</h4>
                <p>
                  Each webhook has a unique secret key that is used to create a signature for each payload. The
                  signature is included in the <code>X-Webhook-Signature</code> header of the request.
                </p>

                <h5>Verifying the Signature</h5>
                <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                  {`// Node.js example
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
}`}
                </pre>

                <h4>Webhook Payload Format</h4>
                <p>All webhook payloads have the following structure:</p>
                <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                  {`{
  "id": "evt_123456789",
  "event": "file.created",
  "timestamp": "2023-10-20T15:30:45Z",
  "data": {
    // Event-specific data
  }
}`}
                </pre>

                <h4>Available Events</h4>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <code>file.created</code>
                      </td>
                      <td>Triggered when a new file is created</td>
                    </tr>
                    <tr>
                      <td>
                        <code>file.updated</code>
                      </td>
                      <td>Triggered when a file is updated</td>
                    </tr>
                    <tr>
                      <td>
                        <code>file.deleted</code>
                      </td>
                      <td>Triggered when a file is deleted</td>
                    </tr>
                    <tr>
                      <td>
                        <code>folder.created</code>
                      </td>
                      <td>Triggered when a new folder is created</td>
                    </tr>
                    <tr>
                      <td>
                        <code>folder.updated</code>
                      </td>
                      <td>Triggered when a folder is updated</td>
                    </tr>
                    <tr>
                      <td>
                        <code>folder.deleted</code>
                      </td>
                      <td>Triggered when a folder is deleted</td>
                    </tr>
                    <tr>
                      <td>
                        <code>memory.created</code>
                      </td>
                      <td>Triggered when a new memory is created</td>
                    </tr>
                    <tr>
                      <td>
                        <code>memory.updated</code>
                      </td>
                      <td>Triggered when a memory is updated</td>
                    </tr>
                    <tr>
                      <td>
                        <code>memory.deleted</code>
                      </td>
                      <td>Triggered when a memory is deleted</td>
                    </tr>
                    <tr>
                      <td>
                        <code>ai.conversation</code>
                      </td>
                      <td>Triggered when an AI conversation occurs</td>
                    </tr>
                  </tbody>
                </table>

                <h4>Best Practices</h4>
                <ul>
                  <li>Always verify the webhook signature to ensure the request is legitimate.</li>
                  <li>Implement proper error handling for your webhook endpoint.</li>
                  <li>Respond quickly to webhook requests (within 5 seconds) to avoid timeouts.</li>
                  <li>Set up monitoring and alerting for webhook failures.</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
