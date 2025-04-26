"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Server, HardDrive, Activity, Cpu, MemoryStickIcon as Memory } from "lucide-react"
import { Button } from "@/components/ui/button"
import { aaPanelClient } from "@/lib/aapanel-api"

interface SystemInfo {
  system: string
  version: string
  time: string
  cpuNum: number
  cpuRealUsed: number
  memTotal: number
  memRealUsed: number
  memFree: number
  memCached: number
  memBuffers: number
}

interface DiskInfo {
  path: string
  inodes: string[]
  size: string[]
}

interface NetworkInfo {
  load: {
    max: number
    safe: number
    one: number
    five: number
    limit: number
    fifteen: number
  }
  down: number
  downTotal: number
  mem: {
    memFree: number
    memTotal: number
    memCached: number
    memBuffers: number
    memRealUsed: number
  }
  up: number
  upTotal: number
  upPackets: number
  downPackets: number
  cpu: [number, number]
}

export function ServerDashboard() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [diskInfo, setDiskInfo] = useState<DiskInfo[]>([])
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(true)

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Load all data from the API client (which now returns mock data)
      const [systemTotal, diskInfoData, networkInfoData] = await Promise.all([
        aaPanelClient.getSystemTotal(),
        aaPanelClient.getDiskInfo(),
        aaPanelClient.getNetworkInfo(),
      ])

      setSystemInfo(systemTotal)
      setDiskInfo(diskInfoData)
      setNetworkInfo(networkInfoData)
      setIsDemoMode(true) // Always in demo mode in preview
    } catch (err) {
      console.error("Error loading server data:", err)
      setError("Failed to load server information. Using demo data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(loadData, 30000)

    return () => clearInterval(interval)
  }, [])

  if (loading && !systemInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="disk">Disk</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {isDemoMode && (
        <div className="bg-amber-50 p-4 rounded-md text-amber-700 mb-4">
          <p className="flex items-center">
            <Server className="h-4 w-4 mr-2" />
            Displaying demo data. Server API is not available in preview mode.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
          <p className="flex items-center">
            <Server className="h-4 w-4 mr-2" />
            {error}
          </p>
        </div>
      )}

      <TabsContent value="overview" className="space-y-4">
        {systemInfo && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">System Information</CardTitle>
                <CardDescription>{systemInfo.system}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Panel Version</p>
                    <p className="font-medium">{systemInfo.version}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <p className="font-medium">{systemInfo.time}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Cpu className="h-5 w-5 mr-2 text-blue-500" />
                    CPU Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{systemInfo.cpuNum} Cores</span>
                      <span className="font-medium">{systemInfo.cpuRealUsed.toFixed(1)}%</span>
                    </div>
                    <Progress value={systemInfo.cpuRealUsed} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Memory className="h-5 w-5 mr-2 text-green-500" />
                    Memory Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {systemInfo.memRealUsed} MB / {systemInfo.memTotal} MB
                      </span>
                      <span className="font-medium">
                        {((systemInfo.memRealUsed / systemInfo.memTotal) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={(systemInfo.memRealUsed / systemInfo.memTotal) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </TabsContent>

      <TabsContent value="disk">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HardDrive className="h-5 w-5 mr-2 text-orange-500" />
              Disk Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {diskInfo.map((disk, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{disk.path}</span>
                    <span className="text-sm text-muted-foreground">
                      {disk.size[1]} / {disk.size[0]} ({disk.size[3]})
                    </span>
                  </div>
                  <Progress value={Number.parseInt(disk.size[3])} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Inodes: {disk.inodes[1]} / {disk.inodes[0]} ({disk.inodes[3]})
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="network">
        {networkInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-purple-500" />
                  Network Traffic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Download</span>
                      <span className="font-medium">{networkInfo.down.toFixed(2)} KB/s</span>
                    </div>
                    <Progress value={(networkInfo.down / 1000) * 100} max={100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Upload</span>
                      <span className="font-medium">{networkInfo.up.toFixed(2)} KB/s</span>
                    </div>
                    <Progress value={(networkInfo.up / 1000) * 100} max={100} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Download</p>
                      <p className="font-medium">{(networkInfo.downTotal / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Upload</p>
                      <p className="font-medium">{(networkInfo.upTotal / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Server className="h-5 w-5 mr-2 text-red-500" />
                  Server Load
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">1 Minute</span>
                      <span className="font-medium">{networkInfo.load.one.toFixed(2)}</span>
                    </div>
                    <Progress value={(networkInfo.load.one / networkInfo.load.safe) * 100} max={100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">5 Minutes</span>
                      <span className="font-medium">{networkInfo.load.five.toFixed(2)}</span>
                    </div>
                    <Progress value={(networkInfo.load.five / networkInfo.load.safe) * 100} max={100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">15 Minutes</span>
                      <span className="font-medium">{networkInfo.load.fifteen.toFixed(2)}</span>
                    </div>
                    <Progress
                      value={(networkInfo.load.fifteen / networkInfo.load.safe) * 100}
                      max={100}
                      className="h-2"
                    />
                  </div>

                  <div className="text-xs text-muted-foreground mt-2">
                    Safe load: {networkInfo.load.safe} | Max load: {networkInfo.load.max}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
