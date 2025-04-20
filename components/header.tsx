"use client"

import { useState } from "react"
import {
  Upload,
  Download,
  Trash,
  MoreVertical,
  Brain,
  LogOut,
  HardDrive,
  Info,
  FilePlus,
  FileText,
  FileCode,
  Settings,
  Users,
  Server,
  Key,
  Share2,
  TabletsIcon as Devices,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAppContext } from "@/lib/app-context"
import { useRouter } from "next/navigation"
import { FileUploadDialog } from "@/components/file-upload-dialog"
import { TemplateSelectorDialog } from "@/components/template-selector-dialog"
import { ManageTemplatesDialog } from "@/components/manage-templates-dialog"
import type { FileTemplate } from "@/lib/templates-service"
import { logoutUser } from "@/app/actions/auth-actions"
import { SyncStatusIndicator } from "@/components/sync-status-indicator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DeviceManager } from "@/components/device-manager"

interface HeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { selectedFileId, fileService, refreshFiles, createNewTextFile, createFileFromTemplate } = useAppContext()
  const router = useRouter()
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false)
  const [isManageTemplatesOpen, setIsManageTemplatesOpen] = useState(false)
  const [isDeviceManagerOpen, setIsDeviceManagerOpen] = useState(false)

  const handleDeleteFile = async () => {
    if (!selectedFileId) return

    if (!confirm("Are you sure you want to delete this file?")) {
      return
    }

    try {
      await fileService.deleteFile(selectedFileId)
      await refreshFiles()
    } catch (error) {
      console.error("Error deleting file:", error)
    }
  }

  const handleDownloadFile = async () => {
    if (!selectedFileId) return

    try {
      await fileService.downloadFile(selectedFileId)
    } catch (error) {
      console.error("Error downloading file:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const handleCreateFromTemplate = (template: FileTemplate, fileName: string) => {
    setIsTemplateSelectorOpen(false)
    createFileFromTemplate(template.id, fileName)
  }

  const handleOpenManageTemplates = () => {
    setIsTemplateSelectorOpen(false)
    setIsManageTemplatesOpen(true)
  }

  return (
    <>
      <header className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold mr-8 flex items-center">
            <Brain className="h-6 w-6 mr-2 text-primary" />
            File Manager with Mem0
          </h1>

          {activeTab === "files" && (
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FilePlus className="h-4 w-4 mr-2" />
                    New
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={createNewTextFile}>
                    <FileText className="h-4 w-4 mr-2" />
                    New Markdown File
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsTemplateSelectorOpen(true)}>
                    <FileCode className="h-4 w-4 mr-2" />
                    From Template
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownloadFile} disabled={!selectedFileId}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button size="sm" variant="outline" onClick={handleDeleteFile} disabled={!selectedFileId}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Add the sync status indicator */}
          <SyncStatusIndicator />

          <Button variant={activeTab === "files" ? "default" : "ghost"} size="sm" onClick={() => onTabChange("files")}>
            <HardDrive className="h-4 w-4 mr-2" />
            Files
          </Button>

          <Button
            variant={activeTab === "network" ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange("network")}
          >
            <Server className="h-4 w-4 mr-2" />
            Network
          </Button>

          <Button
            variant={activeTab === "collaborate" ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange("collaborate")}
          >
            <Users className="h-4 w-4 mr-2" />
            Collaborate
          </Button>

          <Button variant={activeTab === "api" ? "default" : "ghost"} size="sm" onClick={() => onTabChange("api")}>
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </Button>

          <Button variant={activeTab === "info" ? "default" : "ghost"} size="sm" onClick={() => onTabChange("info")}>
            <Info className="h-4 w-4 mr-2" />
            Info
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsManageTemplatesOpen(true)}>
                <Share2 className="h-4 w-4 mr-2" />
                Manage Templates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeviceManagerOpen(true)}>
                <Devices className="h-4 w-4 mr-2" />
                Manage Devices
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTabChange("settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <FileUploadDialog isOpen={isUploadDialogOpen} onClose={() => setIsUploadDialogOpen(false)} />
      <TemplateSelectorDialog
        isOpen={isTemplateSelectorOpen}
        onClose={() => setIsTemplateSelectorOpen(false)}
        onSelectTemplate={handleCreateFromTemplate}
        onManageTemplates={handleOpenManageTemplates}
      />
      <ManageTemplatesDialog isOpen={isManageTemplatesOpen} onClose={() => setIsManageTemplatesOpen(false)} />

      {/* Add Device Manager Dialog */}
      <Dialog open={isDeviceManagerOpen} onOpenChange={setIsDeviceManagerOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Devices & Sync</DialogTitle>
          </DialogHeader>
          <DeviceManager />
        </DialogContent>
      </Dialog>
    </>
  )
}
