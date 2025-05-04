"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Activity, Settings, Wrench, BarChart, Gauge, Zap, FileText, Database, Server, Layers } from "lucide-react"

export default function Mem0SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Settings className="h-8 w-8 mr-2 text-primary" />
          Mem0 Settings
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Wrench className="h-4 w-4 mr-2" />
            Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Memory Configuration
                </CardTitle>
                <CardDescription>Configure how memory is stored and retrieved</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your memory storage settings and configure how memory is used in the application.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/settings/mem0/config">Configure Memory</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  API Settings
                </CardTitle>
                <CardDescription>Configure Mem0 API connection settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your Mem0 API connection settings, including API keys and endpoints.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/settings/mem0/api">API Settings</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gauge className="h-5 w-5 mr-2" />
                  Diagnostics
                </CardTitle>
                <CardDescription>Run diagnostics on your memory system</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Run diagnostics to check the health of your memory system and identify issues.
                </p>
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    Troubleshooting
                  </Badge>
                  <Badge variant="outline">Maintenance</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/settings/mem0/diagnostics">Run Diagnostics</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Performance Monitor
                </CardTitle>
                <CardDescription>Monitor memory operation performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Track the performance of memory operations in real-time and identify bottlenecks.
                </p>
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    Monitoring
                  </Badge>
                  <Badge variant="outline">Performance</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/settings/mem0/performance">Monitor Performance</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2" />
                  Benchmarks
                </CardTitle>
                <CardDescription>Run performance benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Run standardized benchmarks to measure memory operation performance and compare results.
                </p>
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    Performance
                  </Badge>
                  <Badge variant="outline">Testing</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/settings/mem0/benchmarks">Run Benchmarks</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Memory Logs
                </CardTitle>
                <CardDescription>View memory operation logs</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  View logs of memory operations to troubleshoot issues and understand system behavior.
                </p>
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    Logging
                  </Badge>
                  <Badge variant="outline">Troubleshooting</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/settings/mem0/logs">View Logs</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Memory Repair
                </CardTitle>
                <CardDescription>Repair memory system issues</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Repair issues with your memory system, including rebuilding indices and fixing corrupted data.
                </p>
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    Maintenance
                  </Badge>
                  <Badge variant="outline">Repair</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/settings/mem0/repair">Repair Memory</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layers className="h-5 w-5 mr-2" />
                  Memory Migration
                </CardTitle>
                <CardDescription>Migrate memory data between storage systems</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Migrate memory data between different storage systems, such as local storage and Mem0 API.
                </p>
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    Migration
                  </Badge>
                  <Badge variant="outline">Data Management</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/settings/mem0/migration">Migrate Memory</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
