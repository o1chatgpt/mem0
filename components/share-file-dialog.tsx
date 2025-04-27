"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link, Copy, Calendar, Lock, Download, Pencil, Trash2, CheckCircle2, Clock, Eye } from "lucide-react"
import { useAppContext } from "@/lib/app-context"
import { shareService, type SharedFile } from "@/lib/share-service"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ShareFileDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ShareFileDialog({ isOpen, onClose }: ShareFileDialogProps) {
  const { selectedFile, memoryStore } = useAppContext()
  const [activeTab, setActiveTab] = useState("create")
  const [shareOptions, setShareOptions] = useState({
    expiresAt: "",
    password: "",
    allowDownload: true,
    allowEdit: false,
  })
  const [existingShares, setExistingShares] = useState<SharedFile[]>([])
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  // Load existing shares when the dialog opens
  useEffect(() => {
    if (isOpen && selectedFile) {
      loadExistingShares()
    }
  }, [isOpen, selectedFile])

  const loadExistingShares = async () => {
    if (!selectedFile) return

    setLoading(true)
    try {
      const shares = await shareService.getSharesForFile(selectedFile.id)
      setExistingShares(shares)

      // If there are existing shares, switch to the manage tab
      if (shares.length > 0) {
        setActiveTab("manage")
      }
    } catch (error) {
      console.error("Error loading shares:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateShare = async () => {
    if (!selectedFile) return

    setLoading(true)
    try {
      const options = {
        expiresAt: shareOptions.expiresAt ? new Date(shareOptions.expiresAt) : undefined,
        password: shareOptions.password || undefined,
        allowDownload: shareOptions.allowDownload,
        allowEdit: shareOptions.allowEdit,
      }

      const sharedFile = await shareService.shareFile(selectedFile, options)
      const url = shareService.getShareUrl(sharedFile.shareId)
      setShareUrl(url)

      // Record in memory
      await memoryStore.addMemory(`Shared file: ${selectedFile.name} with link: ${url}`)

      // Refresh the list of shares
      await loadExistingShares()

      // Switch to the "manage" tab
      setActiveTab("manage")
    } catch (error) {
      console.error("Error creating share:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async (shareId: string) => {
    const url = shareService.getShareUrl(shareId)
    await navigator.clipboard.writeText(url)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const handleRevokeShare = async (shareId: string) => {
    if (
      !confirm(
        "Are you sure you want to revoke this share? Anyone with the link will no longer be able to access the file.",
      )
    ) {
      return
    }

    setLoading(true)
    try {
      await shareService.revokeShare(shareId)

      // Record in memory
      if (selectedFile) {
        await memoryStore.addMemory(`Revoked share for file: ${selectedFile.name}`)
      }

      // Refresh the list of shares
      await loadExistingShares()
    } catch (error) {
      console.error("Error revoking share:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Never"
    return new Date(date).toLocaleString()
  }

  const getExpirationStatus = (expiresAt: Date | undefined) => {
    if (!expiresAt) return null

    const now = new Date()
    const expiration = new Date(expiresAt)

    if (now > expiration) {
      return <Badge variant="destructive">Expired</Badge>
    }

    const daysLeft = Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysLeft <= 1) {
      return <Badge variant="destructive">Expires today</Badge>
    } else if (daysLeft <= 3) {
      return <Badge variant="destructive">Expires in {daysLeft} days</Badge>
    } else {
      return <Badge variant="outline">Expires in {daysLeft} days</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
        </DialogHeader>

        {selectedFile ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Share</TabsTrigger>
              <TabsTrigger value="manage">Manage Shares</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expiration">Expiration Date (Optional)</Label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="expiration"
                      type="datetime-local"
                      value={shareOptions.expiresAt}
                      onChange={(e) => setShareOptions({ ...shareOptions, expiresAt: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password Protection (Optional)</Label>
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Leave empty for no password"
                      value={shareOptions.password}
                      onChange={(e) => setShareOptions({ ...shareOptions, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Permissions</Label>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <span>Allow Download</span>
                    </div>
                    <Switch
                      checked={shareOptions.allowDownload}
                      onCheckedChange={(checked) => setShareOptions({ ...shareOptions, allowDownload: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                      <span>Allow Edit</span>
                    </div>
                    <Switch
                      checked={shareOptions.allowEdit}
                      onCheckedChange={(checked) => setShareOptions({ ...shareOptions, allowEdit: checked })}
                    />
                  </div>
                </div>

                <Button className="w-full" onClick={handleCreateShare} disabled={loading}>
                  <Link className="h-4 w-4 mr-2" />
                  {loading ? "Creating Share..." : "Create Share Link"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="manage" className="space-y-4 py-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : existingShares.length === 0 ? (
                <div className="text-center py-8">
                  <Link className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Shares Found</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    You haven't shared this file yet. Switch to the "Create Share" tab to create a share link.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {existingShares.map((share) => (
                    <div key={share.id} className="border rounded-md p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Link className="h-4 w-4 text-primary" />
                          <span className="font-medium">Share Link</span>
                          {share.password && <Lock className="h-3 w-3 text-muted-foreground" />}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleCopyLink(share.shareId)}>
                          {copied ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Link
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Created:</span>
                          <span>{formatDate(share.createdAt)}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Expires:</span>
                          <span>{formatDate(share.expiresAt)}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Views:</span>
                          <span>{share.accessCount}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Last accessed:</span>
                          <span>{formatDate(share.lastAccessedAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {getExpirationStatus(share.expiresAt)}

                        {share.allowDownload && (
                          <Badge variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Badge>
                        )}

                        {share.allowEdit && (
                          <Badge variant="outline">
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Badge>
                        )}
                      </div>

                      <div className="pt-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeShare(share.shareId)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Revoke Share
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {shareUrl && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700">Share link created successfully!</AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-6 text-center">
            <p>No file selected. Please select a file to share.</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
