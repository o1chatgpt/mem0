"use client"

import { useState, useEffect } from "react"
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
import { ErrorBoundary } from "react-error-boundary"
import { aaPanelClient } from "@/lib/aapanel-api"

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-md">
      <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h2>
      <p className="text-red-600 mb-4">There was an error loading this component.</p>
      <button onClick={resetErrorBoundary} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
        Try again
      </button>
    </div>
  )
}

export default function DirectEntryPage() {
  const [activeTab, setActiveTab] = useState("files")

  useEffect(() => {
    // Always force demo mode for direct-entry page
    aaPanelClient.setDemoMode(true)
  }, [])

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
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <ServerDashboard />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="websites">
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <WebsiteManager />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="ai-family">
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AIFamily />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="info">
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <FileManagementInfo />
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </div>

        <LoadingOverlay />
      </div>
    </AppProvider>
  )
}
