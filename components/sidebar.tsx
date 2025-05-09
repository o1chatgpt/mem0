import { LayoutDashboard, Settings, Brain, Bell, FileText, FolderOpen, Key, Workflow, Globe } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import type { SidebarNavItem } from "@/components/sidebar-nav"

interface SidebarProps {
  isCollapsed: boolean
}

// Update the sidebarNavItems array to include the API Keys link
const sidebarNavItems: SidebarNavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    variant: "default",
  },
  {
    title: "Files",
    href: "/files",
    icon: FileText,
    variant: "default",
  },
  {
    title: "Folders",
    href: "/folders",
    icon: FolderOpen,
    variant: "default",
  },
  {
    title: "Memories",
    href: "/memories",
    icon: Brain,
    variant: "default",
  },
  {
    title: "Webhooks",
    href: "/webhooks",
    icon: Bell,
    variant: "default",
  },
  {
    title: "CrewAI",
    href: "/crewai",
    icon: Workflow,
    variant: "default",
    color: "text-purple-500",
  },
  {
    title: "API Hub",
    href: "/api-hub",
    icon: Globe,
    variant: "default",
  },
  {
    title: "API Keys",
    href: "/api-keys",
    icon: Key,
    variant: "default",
    color: "text-yellow-500",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    variant: "default",
  },
]

export function Sidebar({ isCollapsed }: SidebarProps) {
  return (
    <div className="flex h-full w-full flex-col border-r bg-secondary">
      <div className="flex-1 space-y-2 p-6">
        <MainNav className="px-3" />
        <div className="space-y-1">
          <h4 className="mb-2 px-3 text-sm font-medium">Navigation</h4>
          <ul className="menu w-full p-0">
            {sidebarNavItems.map((item) => (
              <li key={item.href}>
                <a href={item.href}>
                  <item.icon className={`mr-2 h-4 w-4 ${item.color || ""}`} />
                  <span>{item.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
