"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { LoadingOverlay } from "@/components/loading-overlay"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Dynamically import components that use browser APIs
const FileExplorer = dynamic(() => import("@/components/file-explorer").then((mod) => mod.FileExplorer), { ssr: false })
const FileViewer = dynamic(() => import("@/components/file-viewer").then((mod) => mod.FileViewer), { ssr: false })
const FileManagementInfo = dynamic(
  () => import("@/components/file-management-info").then((mod) => mod.FileManagementInfo),
  { ssr: false },
)
const NetworkServers = dynamic(() => import("@/components/network-servers").then((mod) => mod.NetworkServers), {
  ssr: false,
})
const ApiKeyManager = dynamic(() => import("@/components/api-key-manager").then((mod) => mod.ApiKeyManager), {
  ssr: false,
})
const CollaborationPanel = dynamic(
  () => import("@/components/collaboration-panel").then((mod) => mod.CollaborationPanel),
  { ssr: false },
)
const AppProvider = dynamic(() => import("@/lib/app-context").then((mod) => mod.AppProvider), { ssr: false })

export default function FilesPage() {
  const [activeTab, setActiveTab] = useState("files")

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">File Manager with Mem0</h1>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <p>Loading application...</p>
      </div>

      {/* The actual app will be loaded client-side only */}
      <AppProvider>
        <div className="flex flex-col h-screen">
          <Header activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="flex-1 overflow-hidden p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="mb-4">
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="network">Network</TabsTrigger>
                <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
                <TabsTrigger value="api">API Keys</TabsTrigger>
                <TabsTrigger value="info">System Info</TabsTrigger>
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
      </AppProvider>
    </div>
  )
}
