"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  ChevronRight,
  Home,
  Users,
  Mic,
  PenToolIcon as Tool,
  Settings,
  FileText,
  BarChart,
  Presentation,
  Upload,
  BookOpen,
  ShoppingCart,
  Briefcase,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AI_FAMILY_MEMBERS } from "@/lib/data/ai-family"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    aiFamily: false,
    tools: false,
    content: false,
  })

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <div className={cn("flex h-screen w-64 flex-col border-r bg-background", className)}>
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center font-semibold">
          <span className="text-xl">AI Family Manager</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              isActive("/dashboard") ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>

          {/* AI Family Section */}
          <div>
            <Button
              variant="ghost"
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              onClick={() => toggleSection("aiFamily")}
            >
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4" />
                <span>AI Family</span>
              </div>
              {openSections.aiFamily ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            {openSections.aiFamily && (
              <div className="ml-4 mt-1 grid gap-1">
                <Link
                  href="/ai-family"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    isActive("/ai-family") && !pathname.includes("/ai-family/")
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <span>All Members</span>
                </Link>
                {AI_FAMILY_MEMBERS.map((member) => (
                  <Link
                    key={member.id}
                    href={`/ai-family/${member.id}`}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      isActive(`/ai-family/${member.id}`)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <span>{member.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Voice Services */}
          <Link
            href="/voice-services"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              isActive("/voice-services") ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
          >
            <Mic className="h-4 w-4" />
            <span>Voice Services</span>
          </Link>

          {/* Tools Section */}
          <div>
            <Button
              variant="ghost"
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              onClick={() => toggleSection("tools")}
            >
              <div className="flex items-center gap-3">
                <Tool className="h-4 w-4" />
                <span>Tools</span>
              </div>
              {openSections.tools ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            {openSections.tools && (
              <div className="ml-4 mt-1 grid gap-1">
                <Link
                  href="/tools"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    isActive("/tools") && !pathname.includes("/tools/")
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <span>All Tools</span>
                </Link>
                <Link
                  href="/tools/create"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    isActive("/tools/create") ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <span>Create Tool</span>
                </Link>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div>
            <Button
              variant="ghost"
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              onClick={() => toggleSection("content")}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4" />
                <span>Content</span>
              </div>
              {openSections.content ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            {openSections.content && (
              <div className="ml-4 mt-1 grid gap-1">
                <Link
                  href="/analytics"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    isActive("/analytics") ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <BarChart className="h-4 w-4" />
                  <span>Analytics</span>
                </Link>
                <Link
                  href="/presentations"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    isActive("/presentations") ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <Presentation className="h-4 w-4" />
                  <span>Presentations</span>
                </Link>
                <Link
                  href="/upload"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    isActive("/upload") ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </Link>
                <Link
                  href="/demos"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    isActive("/demos") ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Demos</span>
                </Link>
                <Link
                  href="/case-studies"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    isActive("/case-studies") ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Case Studies</span>
                </Link>
                <Link
                  href="/sales"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    isActive("/sales") ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Sales</span>
                </Link>
                <Link
                  href="/training"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    isActive("/training") ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <GraduationCap className="h-4 w-4" />
                  <span>Training</span>
                </Link>
              </div>
            )}
          </div>

          {/* Settings */}
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              isActive("/settings") ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}
