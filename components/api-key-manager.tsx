"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Check, Copy, Eye, EyeOff, Key, Loader2, RefreshCw, Save, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

interface ApiKey {
  id: number
  service: string
  key: string
  created_at: string
  is_active: boolean
}

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showKey, setShowKey] = useState<Record<number, boolean>>({})
  const [newKey, setNewKey] = useState("")
  const [newService, setNewService] = useState("openai")
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/api-keys", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch API keys")
      }

      const data = await response.json()
      setApiKeys(data.keys || [])
    } catch (error) {
      console.error("Error fetching API keys:", error)
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleShowKey = (id: number) => {
    setShowKey((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    })
  }

  const handleAddKey = async () => {
    if (!newKey || !newService) {
      toast({
        title: "Error",
        description: "Please enter both a service name and API key",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: newService,
          key: newKey,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add API key")
      }

      const data = await response.json()
      setApiKeys((prev) => [...prev, data.key])
      setNewKey("")
      setNewService("openai")
      setIsAdding(false)
      toast({
        title: "Success",
        description: "API key added successfully",
      })
    } catch (error) {
      console.error("Error adding API key:", error)
      toast({
        title: "Error",
        description: "Failed to add API key",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleKeyStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update API key status")
      }

      const data = await response.json()
      setApiKeys((prev) => prev.map((key) => (key.id === id ? { ...key, is_active: data.key.is_active } : key)))
      toast({
        title: "Success",
        description: `API key ${data.key.is_active ? "activated" : "deactivated"} successfully`,
      })
    } catch (error) {
      console.error("Error updating API key status:", error)
      toast({
        title: "Error",
        description: "Failed to update API key status",
        variant: "destructive",
      })
    }
  }

  const deleteKey = async (id: number) => {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error("Failed to delete API key")
      }

      setApiKeys((prev) => prev.filter((key) => key.id !== id))
      toast({
        title: "Success",
        description: "API key deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting API key:", error)
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      })
    }
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return "••••••••"
    return key.substring(0, 4) + "••••••••••••••••" + key.substring(key.length - 4)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5" />
            API Key Management
          </CardTitle>
          <CardDescription>Manage your API keys for external services</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {apiKeys.length === 0 && !isAdding ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No API keys found. Add your first API key to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium capitalize">{key.service}</div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant={key.is_active ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleKeyStatus(key.id, key.is_active)}
                          >
                            {key.is_active ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                            {key.is_active ? "Active" : "Inactive"}
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => toggleShowKey(key.id)}>
                            {showKey[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard(key.key)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => deleteKey(key.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="font-mono text-sm bg-muted p-2 rounded">
                        {showKey[key.id] ? key.key : maskApiKey(key.key)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Added on {new Date(key.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isAdding && (
                <div className="border rounded-md p-4 mt-4">
                  <h3 className="font-medium mb-2">Add New API Key</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="service">Service</Label>
                      <select
                        id="service"
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="google">Google AI</option>
                        <option value="azure">Azure OpenAI</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        placeholder="Enter API key"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAdding(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddKey} disabled={isSaving}>
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={fetchApiKeys}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)}>
              <Key className="h-4 w-4 mr-2" />
              Add API Key
            </Button>
          )}
        </CardFooter>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Security Notice</AlertTitle>
        <AlertDescription>
          API keys are stored securely but should be treated as sensitive information. Never share your API keys with
          others or expose them in client-side code.
        </AlertDescription>
      </Alert>
    </div>
  )
}
