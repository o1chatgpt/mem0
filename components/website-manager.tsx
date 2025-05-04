"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Globe, Plus, Trash2, Play, Pause, Download, RefreshCw, ExternalLink, AlertTriangle } from "lucide-react"
import { aaPanelClient } from "@/lib/aapanel-api"

interface Website {
  id: number
  name: string
  path: string
  status: string
  ps: string
  addtime: string
  edate: string
  domain: number
  backup_count: number
}

export function WebsiteManager() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [phpVersions, setPhpVersions] = useState<{ version: string; name: string }[]>([])
  const [siteTypes, setSiteTypes] = useState<{ id: number; name: string }[]>([])
  const [isDemoMode, setIsDemoMode] = useState(aaPanelClient.getDemoMode())

  // New website form state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newSite, setNewSite] = useState({
    domain: "",
    path: "",
    type_id: "0",
    version: "",
    port: "80",
    ps: "",
    createFtp: false,
    ftpUsername: "",
    ftpPassword: "",
    createDb: false,
    dbCharset: "utf8",
    dbUsername: "",
    dbPassword: "",
  })

  // Improved loadWebsites function with better error handling
  const loadWebsites = async () => {
    if (loading && websites.length > 0) return // Prevent multiple simultaneous loads

    setLoading(true)
    setError(null)

    try {
      // Force demo mode in preview environments
      if (
        typeof window !== "undefined" &&
        (window.location.hostname.includes("localhost") ||
          window.location.hostname.includes("vercel.app") ||
          window.location.hostname.includes("preview") ||
          window.location.pathname.includes("/direct-entry"))
      ) {
        aaPanelClient.setDemoMode(true)
      }

      // Load websites from the API client
      const response = await aaPanelClient.getWebsites()
      setWebsites(response.data || [])
      setIsDemoMode(aaPanelClient.getDemoMode())
    } catch (err) {
      console.error("Error loading websites:", err)
      setError("Failed to load websites. Using demo data instead.")
      setIsDemoMode(true)
      aaPanelClient.setDemoMode(true)

      // Try to get demo websites as fallback
      try {
        const demoResponse = await aaPanelClient.getDemoWebsites()
        setWebsites(demoResponse.data || [])
      } catch (demoErr) {
        console.error("Error loading demo websites:", demoErr)
        setError("Failed to load websites. Please try again later.")
        setWebsites([])
      }
    } finally {
      setLoading(false)
    }
  }

  // Load PHP versions with error handling
  const loadPhpVersions = async () => {
    try {
      const versions = await aaPanelClient.getPhpVersions()
      setPhpVersions(versions || [])
    } catch (err) {
      console.error("Error loading PHP versions:", err)
      // Default versions are already handled in the API client
    }
  }

  // Load site types with error handling
  const loadSiteTypes = async () => {
    try {
      const types = await aaPanelClient.getSiteTypes()
      setSiteTypes(types || [])
    } catch (err) {
      console.error("Error loading site types:", err)
      // Default types are already handled in the API client
    }
  }

  // Initialize data on component mount
  useEffect(() => {
    const initData = async () => {
      try {
        // Force demo mode in preview environments
        if (
          typeof window !== "undefined" &&
          (window.location.hostname.includes("localhost") ||
            window.location.hostname.includes("vercel.app") ||
            window.location.hostname.includes("preview") ||
            window.location.pathname.includes("/direct-entry"))
        ) {
          aaPanelClient.setDemoMode(true)
          setIsDemoMode(true)
        }

        await loadWebsites()
        await loadPhpVersions()
        await loadSiteTypes()
      } catch (error) {
        console.error("Error initializing data:", error)
        setError("Failed to initialize data. Please refresh the page.")
        setIsDemoMode(true)
        aaPanelClient.setDemoMode(true)

        // Try to load demo data as fallback
        try {
          const demoResponse = await aaPanelClient.getDemoWebsites()
          setWebsites(demoResponse.data || [])
        } catch (demoErr) {
          console.error("Error loading demo websites:", demoErr)
        }
      }
    }

    initData()

    // Cleanup function
    return () => {
      // Any cleanup if needed
    }
  }, [])

  const handleCreateWebsite = async () => {
    setLoading(true)
    setError(null)

    try {
      await aaPanelClient.createWebsite({
        webname: newSite.domain,
        path: newSite.path,
        type_id: Number.parseInt(newSite.type_id),
        version: newSite.version,
        port: Number.parseInt(newSite.port),
        ps: newSite.ps,
        ftp: newSite.createFtp,
        ftp_username: newSite.createFtp ? newSite.ftpUsername : undefined,
        ftp_password: newSite.createFtp ? newSite.ftpPassword : undefined,
        sql: newSite.createDb,
        codeing: newSite.createDb ? newSite.dbCharset : undefined,
        datauser: newSite.createDb ? newSite.dbUsername : undefined,
        datapassword: newSite.createDb ? newSite.dbPassword : undefined,
      })

      setIsCreateDialogOpen(false)
      await loadWebsites()

      // Reset form
      setNewSite({
        domain: "",
        path: "",
        type_id: "0",
        version: "",
        port: "80",
        ps: "",
        createFtp: false,
        ftpUsername: "",
        ftpPassword: "",
        createDb: false,
        dbCharset: "utf8",
        dbUsername: "",
        dbPassword: "",
      })
    } catch (err) {
      console.error("Error creating website:", err)
      setError("Failed to create website. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWebsite = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete the website ${name}?`)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      await aaPanelClient.deleteWebsite(id, name, {
        ftp: true,
        database: true,
        path: true,
      })

      await loadWebsites()
    } catch (err) {
      console.error("Error deleting website:", err)
      setError("Failed to delete website. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleWebsiteStatus = async (id: number, name: string, status: string) => {
    setLoading(true)
    setError(null)

    try {
      if (status === "1") {
        await aaPanelClient.stopWebsite(id, name)
      } else {
        await aaPanelClient.startWebsite(id, name)
      }

      await loadWebsites()
    } catch (err) {
      console.error("Error toggling website status:", err)
      setError("Failed to update website status. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleBackupWebsite = async (id: number) => {
    setLoading(true)
    setError(null)

    try {
      await aaPanelClient.createWebsiteBackup(id)
      await loadWebsites()
    } catch (err) {
      console.error("Error backing up website:", err)
      setError("Failed to backup website. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "0000-00-00") return "Never"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (e) {
      return "Invalid date"
    }
  }

  // Show loading state only on initial load
  if (loading && websites.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Websites</h2>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Website
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Website</DialogTitle>
              <DialogDescription>Fill in the details to create a new website on your server.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain Name</Label>
                <Input
                  id="domain"
                  value={newSite.domain}
                  onChange={(e) => setNewSite({ ...newSite, domain: e.target.value })}
                  placeholder="example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="path">Website Path</Label>
                <Input
                  id="path"
                  value={newSite.path}
                  onChange={(e) => setNewSite({ ...newSite, path: e.target.value })}
                  placeholder="/www/wwwroot/example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Website Type</Label>
                <Select value={newSite.type_id} onValueChange={(value) => setNewSite({ ...newSite, type_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {siteTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="php">PHP Version</Label>
                <Select value={newSite.version} onValueChange={(value) => setNewSite({ ...newSite, version: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select PHP version" />
                  </SelectTrigger>
                  <SelectContent>
                    {phpVersions.map((php) => (
                      <SelectItem key={php.version} value={php.version}>
                        {php.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  value={newSite.port}
                  onChange={(e) => setNewSite({ ...newSite, port: e.target.value })}
                  placeholder="80"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ps">Description</Label>
                <Input
                  id="ps"
                  value={newSite.ps}
                  onChange={(e) => setNewSite({ ...newSite, ps: e.target.value })}
                  placeholder="Website description"
                />
              </div>

              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newSite.createFtp}
                    onCheckedChange={(checked) => setNewSite({ ...newSite, createFtp: checked })}
                  />
                  <Label>Create FTP Account</Label>
                </div>
              </div>

              {newSite.createFtp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ftpUsername">FTP Username</Label>
                    <Input
                      id="ftpUsername"
                      value={newSite.ftpUsername}
                      onChange={(e) => setNewSite({ ...newSite, ftpUsername: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ftpPassword">FTP Password</Label>
                    <Input
                      id="ftpPassword"
                      type="password"
                      value={newSite.ftpPassword}
                      onChange={(e) => setNewSite({ ...newSite, ftpPassword: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newSite.createDb}
                    onCheckedChange={(checked) => setNewSite({ ...newSite, createDb: checked })}
                  />
                  <Label>Create Database</Label>
                </div>
              </div>

              {newSite.createDb && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dbCharset">Database Charset</Label>
                    <Select
                      value={newSite.dbCharset}
                      onValueChange={(value) => setNewSite({ ...newSite, dbCharset: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utf8">UTF-8</SelectItem>
                        <SelectItem value="utf8mb4">UTF-8 MB4</SelectItem>
                        <SelectItem value="gbk">GBK</SelectItem>
                        <SelectItem value="big5">BIG5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dbUsername">Database Username</Label>
                    <Input
                      id="dbUsername"
                      value={newSite.dbUsername}
                      onChange={(e) => setNewSite({ ...newSite, dbUsername: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="dbPassword">Database Password</Label>
                    <Input
                      id="dbPassword"
                      type="password"
                      value={newSite.dbPassword}
                      onChange={(e) => setNewSite({ ...newSite, dbPassword: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWebsite} disabled={loading}>
                {loading ? "Creating..." : "Create Website"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isDemoMode && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Demo Mode Active</AlertTitle>
          <AlertDescription>
            Displaying demo data. The server API connection is not available in this environment. Actions will be
            simulated.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button variant="outline" className="mt-2" onClick={loadWebsites}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {websites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Globe className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Websites Found</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              You haven't created any websites yet. Click the "Create Website" button to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {websites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell>
                      <div className="font-medium">{site.name}</div>
                      <div className="text-sm text-muted-foreground">{site.ps}</div>
                    </TableCell>
                    <TableCell>
                      {site.status === "1" ? (
                        <Badge variant="success">Running</Badge>
                      ) : (
                        <Badge variant="destructive">Stopped</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{site.path}</TableCell>
                    <TableCell>{formatDate(site.addtime)}</TableCell>
                    <TableCell>{formatDate(site.edate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleToggleWebsiteStatus(site.id, site.name, site.status)}
                          title={site.status === "1" ? "Stop Website" : "Start Website"}
                        >
                          {site.status === "1" ? (
                            <Pause className="h-4 w-4 text-amber-500" />
                          ) : (
                            <Play className="h-4 w-4 text-green-500" />
                          )}
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleBackupWebsite(site.id)}
                          title="Backup Website"
                        >
                          <Download className="h-4 w-4 text-blue-500" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteWebsite(site.id, site.name)}
                          title="Delete Website"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>

                        <Button size="icon" variant="ghost" asChild title="Visit Website">
                          <a href={`http://${site.name}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
