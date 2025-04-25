"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { LoadingOverlay } from "@/components/loading-overlay"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileExplorer } from "@/components/file-explorer"
import { FileViewer } from "@/components/file-viewer"
import { FileManagementInfo } from "@/components/file-management-info"
import { NetworkServers } from "@/components/network-servers"
import { ApiKeyManager } from "@/components/api-key-manager"
import { CollaborationPanel } from "@/components/collaboration-panel"
import { AppProvider } from "@/lib/app-context"

function FilesPageContent() {
  const [activeTab, setActiveTab] = useState("files")

  return (
    <div className="flex flex-col h-screen">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 overflow-hidden p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="mb-4">
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
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

export default function FilesPage() {
  return (
    <AppProvider>
      <FilesPageContent />
    </AppProvider>
  )
}
