"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth, PERMISSIONS } from "@/lib/auth-context"
import { createApiKey, getUserApiKeys, deleteApiKey } from "@/lib/api-key-manager"
import { Loader2, Plus, Trash2, Key, Users, Shield } from "lucide-react"

export default function AdminPage() {
  const { user, hasPermission } = useAuth()
  const router = useRouter()
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [newKeyName, setNewKeyName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Check if user has admin permissions
  useEffect(() => {
    if (user && !hasPermission(PERMISSIONS.MANAGE_API_KEYS) && !hasPermission(PERMISSIONS.ADMIN)) {
      router.push("/")
    }
  }, [user, hasPermission, router])

  // Load API keys
  useEffect(() => {
    const loadApiKeys = async () => {
      if (user) {
        try {
          const keys = await getUserApiKeys(user.id)
          setApiKeys(keys)
        } catch (error) {
          console.error("Error loading API keys:", error)
          setError("Failed to load API keys")
        }
      }
    }

    loadApiKeys()
  }, [user])

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      setError("API key name is required")
      return
    }

    if (selectedPermissions.length === 0) {
      setError("Select at least one permission")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (user) {
        const newKey = await createApiKey(newKeyName, selectedPermissions, user.id)
        setApiKeys([...apiKeys, newKey])
        setNewKeyName("")
        setSelectedPermissions([])
        setSuccess(`API key "${newKey.name}" created successfully. Key: ${newKey.key}`)
      }
    } catch (err) {
      setError("Failed to create API key")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteApiKey = async (id: string) => {
    try {
      if (user) {
        const deleted = await deleteApiKey(id, user.id)
        if (deleted) {
          setApiKeys(apiKeys.filter((key) => key.id !== id))
          setSuccess("API key deleted successfully")
        } else {
          setError("Failed to delete API key")
        }
      }
    } catch (error) {
      console.error("Error deleting API key:", error)
      setError("Failed to delete API key")
    }
  }

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Administration Dashboard</h1>

        <Tabs defaultValue="api-keys">
          <TabsList className="mb-6">
            <TabsTrigger value="api-keys" className="flex items-center">
              <Key className="mr-2 h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys">
            <Card>
              <CardHeader>
                <CardTitle>API Key Management</CardTitle>
                <CardDescription>Create and manage API keys for accessing the WebContainer API</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="key-name">API Key Name</Label>
                      <Input
                        id="key-name"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g., Development Key"
                      />
                    </div>

                    <div>
                      <Label className="block mb-2">Permissions</Label>
                      <div className="space-y-2">
                        {Object.values(PERMISSIONS).map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={`permission-${permission}`}
                              checked={selectedPermissions.includes(permission)}
                              onCheckedChange={() => togglePermission(permission)}
                            />
                            <label
                              htmlFor={`permission-${permission}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {permission.replace("_", " ").toUpperCase()}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleCreateApiKey} disabled={isLoading} className="flex items-center">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Create API Key
                  </Button>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Your API Keys</h3>
                  {apiKeys.length === 0 ? (
                    <p className="text-muted-foreground">No API keys found. Create one to get started.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Key</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Last Used</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiKeys.map((key) => (
                          <TableRow key={key.id}>
                            <TableCell className="font-medium">{key.name}</TableCell>
                            <TableCell className="font-mono text-xs">{key.key}</TableCell>
                            <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : "Never"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteApiKey(key.id)}
                                className="h-8 w-8 p-0 text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  User management functionality will be implemented in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Permission Settings</CardTitle>
                <CardDescription>Configure system-wide permission settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Permission settings will be implemented in a future update.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
