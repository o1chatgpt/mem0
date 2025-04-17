"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { AIFileAssistant } from "@/components/ai-file-assistant"
import { FileAnalyzer } from "@/components/file-analyzer"
import { RealtimeConflictDashboard } from "@/components/realtime-conflict-dashboard"
import { DocumentEcosystem } from "@/components/document-ecosystem"

export default function FilesPage() {
  const [activeTab, setActiveTab] = useState("files")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null) // Add error state
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        if (data.authenticated) {
          setIsAuthenticated(true)
        } else {
          // Redirect to login if not authenticated
          router.push("/auth/login")
        }
      } catch (error: any) {
        console.error("Auth check error:", error)
        setLoadError(error.message || "Failed to check authentication.") // Set error message
        setIsAuthenticated(true) // Fallback to client-side check
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Don't render anything while redirecting
  }

  return (
    <AppProvider>
      <div className="flex flex-col h-screen">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />

        {loadError && ( // Display error message if there's an error
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {loadError}</span>
          </div>
        )}

        <div className="flex-1 overflow-hidden p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="mb-4">
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="server">Server</TabsTrigger>
              <TabsTrigger value="websites">Websites</TabsTrigger>
              <TabsTrigger value="info">System Info</TabsTrigger>
              <TabsTrigger value="ai-family">AI Family</TabsTrigger>
              <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
              <TabsTrigger value="realtime-conflicts">Realtime Conflicts</TabsTrigger>
            </TabsList>

            <TabsContent value="files" className="h-[calc(100%-40px)]">
              <div className="flex h-full overflow-hidden">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="flex flex-1 overflow-hidden">
                    <FileExplorer />
                    <FileViewer />
                  </div>
                  <div className="h-1/3 mt-4">
                    <FileAnalyzer />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="h-[calc(100%-40px)]">
              <DocumentEcosystem />
            </TabsContent>

            <TabsContent value="server">
              <ServerDashboard />
            </TabsContent>

            <TabsContent value="websites">
              <WebsiteManager />
            </TabsContent>

            <TabsContent value="info">
              <FileManagementInfo />
            </TabsContent>

            <TabsContent value="ai-family" className="h-[calc(100%-40px)]">
              <AIFamily />
            </TabsContent>

            <TabsContent value="ai-assistant" className="h-[calc(100%-40px)]">
              <AIFileAssistant />
            </TabsContent>

            <TabsContent value="realtime-conflicts" className="h-[calc(100%-40px)]">
              <RealtimeConflictDashboard />
            </TabsContent>
          </Tabs>
        </div>

        <LoadingOverlay />
      </div>
    </AppProvider>
  )
}
