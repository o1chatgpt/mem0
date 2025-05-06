"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { LoadingOverlay } from "@/components/loading-overlay"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileExplorer } from "@/components/file-explorer"
import { FileViewer } from "@/components/file-viewer"
import { FileManagementInfo } from "@/components/file-management-info"
import { NetworkServers } from "@/components/network-servers"
import { ApiKeyManager } from "@/components/api-key-manager"
import { CollaborationPanel } from "@/components/collaboration-panel"
import { MemoryDashboard } from "@/components/memory-dashboard"
import { Brain } from "lucide-react"
import { WelcomeScreen } from "@/components/welcome-screen"
import { MemoryUsageInsights } from "@/components/memory-usage-insights"

export default function FilesPage() {
  const [activeTab, setActiveTab] = useState("files")
  const [showWelcome, setShowWelcome] = useState(true)

  // Check if we've shown the welcome screen before
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome")
    if (hasSeenWelcome) {
      setShowWelcome(false)
    }
  }, [])

  const dismissWelcome = () => {
    localStorage.setItem("hasSeenWelcome", "true")
    setShowWelcome(false)
  }

  if (showWelcome) {
    return <WelcomeScreen onDismiss={dismissWelcome} />
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 overflow-hidden p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="mb-4">
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
            <TabsTrigger value="memory" className="flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              Memory
            </TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="h-[calc(100%-40px)]">
            <div className="flex h-full overflow-hidden">
              <FileExplorer />
              <FileViewer />
            </div>
          </TabsContent>

          <TabsContent value="network">
            <NetworkServers />
          </TabsContent>

          <TabsContent value="collaborate">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <FileViewer />
              </div>
              <div>
                <CollaborationPanel />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api">
            <ApiKeyManager />
          </TabsContent>

          <TabsContent value="memory" className="h-[calc(100%-40px)] overflow-auto">
            <MemoryDashboard />
            {/* Add memory usage insights */}
            <div className="mt-6">
              <MemoryUsageInsights />
            </div>
          </TabsContent>

          <TabsContent value="info">
            <FileManagementInfo />
          </TabsContent>

          <TabsContent value="settings">
            <div className="p-4">
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <p>Settings panel coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <LoadingOverlay />
    </div>
  )
}
