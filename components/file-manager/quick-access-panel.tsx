"use client"

import type React from "react"

import { useState } from "react"
import { Folder, Star, Clock, Download, Trash, Plus, FileText, FileImage, FileArchive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMem0 } from "@/components/mem0/mem0-provider"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type QuickAccessItem = {
  id: string
  name: string
  type: "folder" | "file"
  icon: React.ReactNode
  path: string
  date?: string
  fileType?: string
}

// More realistic sample data
const recentItems: QuickAccessItem[] = [
  {
    id: "r1",
    name: "Budget 2023.xlsx",
    type: "file",
    icon: <FileText className="h-4 w-4" />,
    path: "/documents/budget-2023.xlsx",
    date: "Today, 10:23 AM",
    fileType: "spreadsheet",
  },
  {
    id: "r2",
    name: "Project Proposal.docx",
    type: "file",
    icon: <FileText className="h-4 w-4" />,
    path: "/documents/project-proposal.docx",
    date: "Yesterday, 4:45 PM",
    fileType: "document",
  },
  {
    id: "r3",
    name: "Family Photos",
    type: "folder",
    icon: <Folder className="h-4 w-4" />,
    path: "/photos/family",
    date: "Yesterday, 2:30 PM",
  },
  {
    id: "r4",
    name: "Vacation.jpg",
    type: "file",
    icon: <FileImage className="h-4 w-4" />,
    path: "/photos/vacation.jpg",
    date: "2 days ago",
    fileType: "image",
  },
]

const favoriteItems: QuickAccessItem[] = [
  {
    id: "f1",
    name: "Documents",
    type: "folder",
    icon: <Folder className="h-4 w-4" />,
    path: "/documents",
  },
  {
    id: "f2",
    name: "Projects",
    type: "folder",
    icon: <Folder className="h-4 w-4" />,
    path: "/projects",
  },
  {
    id: "f3",
    name: "Resume.pdf",
    type: "file",
    icon: <FileText className="h-4 w-4" />,
    path: "/documents/resume.pdf",
    fileType: "pdf",
  },
  {
    id: "f4",
    name: "Family Budget.xlsx",
    type: "file",
    icon: <FileText className="h-4 w-4" />,
    path: "/documents/family-budget.xlsx",
    fileType: "spreadsheet",
  },
]

const downloadItems: QuickAccessItem[] = [
  {
    id: "d1",
    name: "Software-1.2.3.zip",
    type: "file",
    icon: <FileArchive className="h-4 w-4" />,
    path: "/downloads/software-1.2.3.zip",
    date: "Today, 11:45 AM",
    fileType: "archive",
  },
  {
    id: "d2",
    name: "Report-Q2.pdf",
    type: "file",
    icon: <FileText className="h-4 w-4" />,
    path: "/downloads/report-q2.pdf",
    date: "Yesterday, 9:30 AM",
    fileType: "pdf",
  },
]

type QuickAccessPanelProps = {
  onItemSelect?: (item: string) => void
}

export function QuickAccessPanel({ onItemSelect }: QuickAccessPanelProps) {
  const [activeTab, setActiveTab] = useState<"favorites" | "recent" | "downloads" | "trash">("favorites")
  const { addMemory, isInitialized } = useMem0()

  const getActiveItems = () => {
    switch (activeTab) {
      case "favorites":
        return favoriteItems
      case "recent":
        return recentItems
      case "downloads":
        return downloadItems
      case "trash":
        return []
      default:
        return favoriteItems
    }
  }

  const handleItemClick = (item: QuickAccessItem) => {
    if (onItemSelect) {
      onItemSelect(item.name)
    }

    // Record this interaction in mem0
    if (isInitialized) {
      addMemory(`User accessed ${item.name} (${item.type}) from ${activeTab} panel`)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Quick Access</h2>
      </div>

      <div className="flex border-b">
        <Button
          variant={activeTab === "favorites" ? "default" : "ghost"}
          className="flex-1 rounded-none"
          onClick={() => setActiveTab("favorites")}
        >
          <Star className="h-4 w-4 mr-2" />
          <span className="text-xs">Favorites</span>
        </Button>
        <Button
          variant={activeTab === "recent" ? "default" : "ghost"}
          className="flex-1 rounded-none"
          onClick={() => setActiveTab("recent")}
        >
          <Clock className="h-4 w-4 mr-2" />
          <span className="text-xs">Recent</span>
        </Button>
      </div>

      <div className="flex border-b">
        <Button
          variant={activeTab === "downloads" ? "default" : "ghost"}
          className="flex-1 rounded-none"
          onClick={() => setActiveTab("downloads")}
        >
          <Download className="h-4 w-4 mr-2" />
          <span className="text-xs">Downloads</span>
        </Button>
        <Button
          variant={activeTab === "trash" ? "default" : "ghost"}
          className="flex-1 rounded-none"
          onClick={() => setActiveTab("trash")}
        >
          <Trash className="h-4 w-4 mr-2" />
          <span className="text-xs">Trash</span>
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {getActiveItems().length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">No items found</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {getActiveItems().map((item) => (
              <li key={item.id}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm h-auto py-2"
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="flex items-start w-full">
                          <div className="mr-2 mt-0.5">{item.icon}</div>
                          <div className="flex-1 overflow-hidden">
                            <div className="truncate">{item.name}</div>
                            {item.date && <div className="text-xs text-muted-foreground truncate">{item.date}</div>}
                          </div>
                          {item.fileType && (
                            <Badge variant="outline" className="ml-2 shrink-0">
                              {item.fileType}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.path}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-2 border-t">
        <Button variant="outline" className="w-full justify-start text-sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Favorite
        </Button>
      </div>
    </div>
  )
}
