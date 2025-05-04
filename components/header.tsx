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
  Settings,
  UserCog,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAppContext } from "@/lib/app-context"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import { ThemeCustomizer } from "./theme-customizer"
import { PermissionGuard } from "./permission-guard"
import { Permission } from "@/lib/permissions"

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
    <header className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="flex items-center">
        <h1 className="text-xl font-bold mr-8 flex items-center text-gray-900 dark:text-gray-100">
          <Brain className="h-6 w-6 mr-2 text-primary" />
          File Manager with Mem0
        </h1>

        {activeTab === "files" && (
          <div className="flex items-center space-x-2">
            <PermissionGuard permission={Permission.CREATE_FILES}>
              <Button
                size="sm"
                variant="outline"
                onClick={createNewTextFile}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
            </PermissionGuard>

            <PermissionGuard permission={Permission.UPLOAD_FILES}>
              <Button
                size="sm"
                variant="outline"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </PermissionGuard>

            <PermissionGuard permission={Permission.DOWNLOAD_FILES}>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadFile}
                disabled={!selectedFileId}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </PermissionGuard>

            <PermissionGuard permission={Permission.DELETE_FILES}>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDeleteFile}
                disabled={!selectedFileId}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </PermissionGuard>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <PermissionGuard permission={Permission.VIEW_FILES}>
          <Button
            variant={activeTab === "files" ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange("files")}
            className={
              activeTab === "files"
                ? "bg-primary text-primary-foreground"
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800"
            }
          >
            <HardDrive className="h-4 w-4 mr-2" />
            Files
          </Button>
        </PermissionGuard>

        <PermissionGuard permission={Permission.VIEW_SERVER}>
          <Button
            variant={activeTab === "server" ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange("server")}
            className={
              activeTab === "server"
                ? "bg-primary text-primary-foreground"
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800"
            }
          >
            <Server className="h-4 w-4 mr-2" />
            Server
          </Button>
        </PermissionGuard>

        <PermissionGuard permission={Permission.VIEW_WEBSITES}>
          <Button
            variant={activeTab === "websites" ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange("websites")}
            className={
              activeTab === "websites"
                ? "bg-primary text-primary-foreground"
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800"
            }
          >
            <Globe className="h-4 w-4 mr-2" />
            Websites
          </Button>
        </PermissionGuard>

        <PermissionGuard permission={Permission.VIEW_AI}>
          <Button
            variant={activeTab === "ai-family" ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange("ai-family")}
            className={
              activeTab === "ai-family"
                ? "bg-primary text-primary-foreground"
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800"
            }
          >
            <Users className="h-4 w-4 mr-2" />
            AI Family
          </Button>
        </PermissionGuard>

        <ThemeToggle />
        <ThemeCustomizer />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
          >
            <PermissionGuard permission={Permission.VIEW_MEMORY}>
              <DropdownMenuItem className="hover:bg-gray-100 dark:hover:bg-gray-700">Memory Settings</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-100 dark:hover:bg-gray-700">
                Export Memory Data
              </DropdownMenuItem>
            </PermissionGuard>

            <PermissionGuard permission={Permission.VIEW_SETTINGS}>
              <DropdownMenuItem asChild>
                <a
                  href="/settings/mem0"
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 w-full px-2 py-1.5 text-sm cursor-pointer"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </a>
              </DropdownMenuItem>
            </PermissionGuard>

            <PermissionGuard permission={Permission.VIEW_USERS}>
              <DropdownMenuItem asChild>
                <a
                  href="/settings/users"
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 w-full px-2 py-1.5 text-sm cursor-pointer"
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  User Management
                </a>
              </DropdownMenuItem>
            </PermissionGuard>

            <PermissionGuard permission={Permission.MANAGE_SYSTEM}>
              <DropdownMenuItem asChild>
                <a
                  href="/settings/demo"
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 w-full px-2 py-1.5 text-sm cursor-pointer"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Demo Settings
                </a>
              </DropdownMenuItem>
            </PermissionGuard>

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
