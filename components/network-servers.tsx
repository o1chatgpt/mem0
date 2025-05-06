"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, Server, Globe, Search } from "lucide-react"
import { networkService, type NetworkServer } from "@/lib/network-service"
import { useToast } from "@/components/ui/use-toast"

export function NetworkServers() {
  const { toast } = useToast()
  const [servers, setServers] = useState<NetworkServer[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadServers()
  }, [])

  const loadServers = async () => {
    setLoading(true)

    try {
      const serverList = await networkService.getServers()
      setServers(serverList)
    } catch (error) {
      console.error("Error loading network servers:", error)
      toast({
        title: "Error",
        description: "Failed to load network servers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      toast({
        title: "Searching",
        description: "Searching across all network servers...",
      })

      const results = await networkService.searchAcrossServers("example")

      toast({
        title: "Search Complete",
        description: `Found ${results.length} files across network servers`,
      })
    } catch (error) {
      console.error("Error searching across servers:", error)
      toast({
        title: "Error",
        description: "Failed to search across network servers",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Network Servers</h2>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadServers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search All
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Servers</CardTitle>
          <CardDescription>File servers in your private network chain</CardDescription>
        </CardHeader>

        <CardContent>
          {servers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Server className="h-12 w-12 mx-auto mb-4" />
              <p>No network servers configured</p>
              <p className="text-sm mt-2">Add servers to your network chain in the configuration</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Server</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {servers.map((server) => (
                  <TableRow key={server.url}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Server className="h-4 w-4 mr-2 text-primary" />
                        {server.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{server.url}</code>
                      </div>
                    </TableCell>
                    <TableCell>
                      {server.status === "online" ? (
                        <Badge variant="success">Online</Badge>
                      ) : server.status === "offline" ? (
                        <Badge variant="destructive">Offline</Badge>
                      ) : (
                        <Badge variant="outline">Unknown</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        Connect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
