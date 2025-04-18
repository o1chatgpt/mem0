"use client"

import {
  Upload,
  Download,
  Trash,
  Plus,
  MoreVertical,
  Brain,
  LogOut,
  Server,
  Globe,
  HardDrive,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAppContext } from "@/lib/app-context"
import { useRouter } from "next/navigation"

interface HeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { selectedFileId, fileService, refreshFiles, createNewTextFile } = useAppContext()
  const router = useRouter()

  const handleDeleteFile = async () => {
    if (!selectedFileId) return

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
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <header className="border-b p-4 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-xl font-bold mr-8 flex items-center">
          <Brain className="h-6 w-6 mr-2 text-primary" />
          File Manager with Mem0
        </h1>

        {activeTab === "files" && (
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={createNewTextFile}>
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
            <Button size="sm" variant="outline">
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
        <Button variant={activeTab === "files" ? "default" : "ghost"} size="sm" onClick={() => onTabChange("files")}>
          <HardDrive className="h-4 w-4 mr-2" />
          Files
        </Button>

        <Button variant={activeTab === "server" ? "default" : "ghost"} size="sm" onClick={() => onTabChange("server")}>
          <Server className="h-4 w-4 mr-2" />
          Server
        </Button>

        <Button
          variant={activeTab === "websites" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("websites")}
        >
          <Globe className="h-4 w-4 mr-2" />
          Websites
        </Button>

        <Button
          variant={activeTab === "ai-family" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("ai-family")}
        >
          <Users className="h-4 w-4 mr-2" />
          AI Family
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Memory Settings</DropdownMenuItem>
            <DropdownMenuItem>Export Memory Data</DropdownMenuItem>
            <DropdownMenuItem>About Mem0 Integration</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
