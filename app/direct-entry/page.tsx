"use client"

import { useState } from "react"
import { FileExplorer } from "@/components/file-explorer"
import { FileViewer } from "@/components/file-viewer"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AppProvider } from "@/lib/app-context"
import { LoadingOverlay } from "@/components/loading-overlay"
import { ServerDashboard } from "@/components/server-dashboard"
import { WebsiteManager } from "@/components/website-manager"
import { FileManagementInfo } from "@/components/file-management-info"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIFamily } from "@/components/ai-family"

export default function DirectEntryPage() {
  const [activeTab, setActiveTab] = useState("files")

  return (
    <AppProvider>
      <div className="flex flex-col h-screen">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 overflow-hidden p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="mb-4">
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="server">Server</TabsTrigger>
              <TabsTrigger value="websites">Websites</TabsTrigger>
              <TabsTrigger value="ai-family">AI Family</TabsTrigger>
              <TabsTrigger value="info">System Info</TabsTrigger>
            </TabsList>

            <TabsContent value="files" className="h-[calc(100%-40px)]">
              <div className="flex h-full overflow-hidden">
                <Sidebar />
                <div className="flex flex-1 overflow-hidden">
                  <FileExplorer />
                  <FileViewer />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="server">
              <ServerDashboard />
            </TabsContent>

            <TabsContent value="websites">
              <WebsiteManager />
            </TabsContent>

            <TabsContent value="ai-family">
              <AIFamily />
            </TabsContent>

            <TabsContent value="info">
              <FileManagementInfo />
            </TabsContent>
          </Tabs>
        </div>

        <LoadingOverlay />
      </div>
    </AppProvider>
  )
}
