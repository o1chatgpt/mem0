"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Key, Plus, Trash2, Copy, RefreshCw, Calendar, Clock } from "lucide-react"
import { apiKeyService, type ApiPartner } from "@/lib/api-key-service"
import { useToast } from "@/components/ui/use-toast"

export function ApiKeyManager() {
  const { toast } = useToast()
  const [partners, setPartners] = useState<ApiPartner[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newPartner, setNewPartner] = useState({
    name: "",
    apiKey: "",
    permissions: [] as string[],
    expiresAt: "",
  })
  const [loading, setLoading] = useState(false)

  // Available permissions
  const availablePermissions = [
    { id: "files:read", label: "Read Files" },
    { id: "files:write", label: "Write Files" },
    { id: "files:delete", label: "Delete Files" },
    { id: "files:share", label: "Share Files" },
    { id: "api:access", label: "API Access" },
    { id: "network:access", label: "Network Access" },
  ]

  // Load partners
  useEffect(() => {
    loadPartners()
  }, [])

  const loadPartners = () => {
    try {
      const allPartners = apiKeyService.getAllPartners()
      setPartners(allPartners)
    } catch (error) {
      console.error("Error loading API partners:", error)
      toast({
        title: "Error",
        description: "Failed to load API partners",
        variant: "destructive",
      })
    }
  }

  const handleGenerateApiKey = () => {
    try {
      const apiKey = apiKeyService.generateApiKey()
      setNewPartner((prev) => ({ ...prev, apiKey }))
    } catch (error) {
      console.error("Error generating API key:", error)
      toast({
        title: "Error",
        description: "Failed to generate API key",
        variant: "destructive",
      })
    }
  }

  const handleAddPartner = async () => {
    if (!newPartner.name || !newPartner.apiKey) {
      toast({
        title: "Validation Error",
        description: "Name and API key are required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const expiresAt = newPartner.expiresAt ? new Date(newPartner.expiresAt) : undefined

      apiKeyService.addPartner({
        name: newPartner.name,
        apiKey: newPartner.apiKey,
        permissions: newPartner.permissions,
        expiresAt,
      })

      toast({
        title: "Success",
        description: "API partner added successfully",
      })

      // Reset form and close dialog
      setNewPartner({
        name: "",
        apiKey: "",
        permissions: [],
        expiresAt: "",
      })
      setIsAddDialogOpen(false)

      // Reload partners
      loadPartners()
    } catch (error) {
      console.error("Error adding API partner:", error)
      toast({
        title: "Error",
        description: "Failed to add API partner",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePartner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API partner?")) {
      return
    }

    try {
      const success = apiKeyService.deletePartner(id)

      if (success) {
        toast({
          title: "Success",
          description: "API partner deleted successfully",
        })

        // Reload partners
        loadPartners()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete API partner",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting API partner:", error)
      toast({
        title: "Error",
        description: "Failed to delete API partner",
        variant: "destructive",
      })
    }
  }

  const handleCopyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey)

    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    })
  }

  const formatDate = (date?: Date) => {
    if (!date) return "Never"
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">API Key Management</h2>

        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Partner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Partners</CardTitle>
          <CardDescription>Manage API keys for partners to access your file system</CardDescription>
        </CardHeader>

        <CardContent>
          {partners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4" />
              <p>No API partners found</p>
              <p className="text-sm mt-2">Add a partner to generate an API key for external access</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="bg-muted px-1 py-0.5 rounded text-xs">
                          {partner.apiKey.substring(0, 8)}...{partner.apiKey.substring(partner.apiKey.length - 8)}
                        </code>
                        <Button variant="ghost" size="icon" onClick={() => handleCopyApiKey(partner.apiKey)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {partner.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {partner.expiresAt ? (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{formatDate(partner.expiresAt)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center">
                          <RefreshCw className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{partner.usageCount} requests</span>
                        </div>
                        {partner.lastUsed && (
                          <div className="flex items-center mt-1">
                            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Last used: {formatDate(partner.lastUsed)}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePartner(partner.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Partner Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add API Partner</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Partner Name</Label>
              <Input
                id="name"
                value={newPartner.name}
                onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                placeholder="Enter partner name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="flex space-x-2">
                <Input
                  id="apiKey"
                  value={newPartner.apiKey}
                  onChange={(e) => setNewPartner({ ...newPartner, apiKey: e.target.value })}
                  placeholder="Enter or generate API key"
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={handleGenerateApiKey}>
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={newPartner.expiresAt}
                onChange={(e) => setNewPartner({ ...newPartner, expiresAt: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={newPartner.permissions.includes(permission.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewPartner({
                            ...newPartner,
                            permissions: [...newPartner.permissions, permission.id],
                          })
                        } else {
                          setNewPartner({
                            ...newPartner,
                            permissions: newPartner.permissions.filter((p) => p !== permission.id),
                          })
                        }
                      }}
                    />
                    <Label htmlFor={`permission-${permission.id}`} className="text-sm">
                      {permission.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPartner} disabled={loading}>
              {loading ? "Adding..." : "Add Partner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
