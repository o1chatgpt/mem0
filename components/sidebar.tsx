import type React from "react"
import {
  LayoutDashboard,
  Settings,
  Brain,
  Bell,
  FileText,
  FolderOpen,
  Key,
  Workflow,
  Globe,
  Tag,
  BarChart2,
  Mail,
  Database,
} from "lucide-react"

import { MainNav } from "@/components/main-nav"
import type { SidebarNavItem } from "@/components/sidebar-nav"

interface SidebarProps {
  isCollapsed: boolean
}

// Update the sidebarNavItems array to include all necessary links
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
    title: "Memory System",
    href: "#",
    icon: Brain,
    variant: "default",
    color: "text-blue-500",
    children: [
      {
        title: "Memories",
        href: "/memories",
        icon: Database,
      },
      {
        title: "Memory Categories",
        href: "/memory-categories",
        icon: Tag,
      },
      {
        title: "Memory Analytics",
        href: "/memory-analytics",
        icon: BarChart2,
      },
      {
        title: "Mem0 Integration",
        href: "/mem0-integration",
        icon: Brain,
      },
    ],
  },
  {
    title: "AI Family",
    href: "/ai-family",
    icon: Users,
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
    title: "Email Templates",
    href: "/email-templates",
    icon: Mail,
    variant: "default",
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
              <li key={item.href} className="mb-1">
                {item.children ? (
                  <details className="dropdown">
                    <summary className="flex items-center">
                      <item.icon className={`mr-2 h-4 w-4 ${item.color || ""}`} />
                      <span>{item.title}</span>
                    </summary>
                    <ul className="menu dropdown-content z-[1] ml-6 mt-1 w-52 rounded-md bg-secondary p-2 shadow">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <a href={child.href} className="flex items-center py-2">
                            {child.icon && <child.icon className="mr-2 h-4 w-4" />}
                            <span>{child.title}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <a href={item.href}>
                    <item.icon className={`mr-2 h-4 w-4 ${item.color || ""}`} />
                    <span>{item.title}</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Add the Users icon
function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
