import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Brain,
  Tag,
  BarChart2,
  Users,
  Bell,
  Workflow,
  Globe,
  Key,
  Mail,
  Settings,
  Database,
  type LucideIcon,
} from "lucide-react"
import type { BreadcrumbItem } from "@/components/breadcrumb"

// Define the route mapping
interface RouteInfo {
  title: string
  icon?: LucideIcon
  parent?: string
}

const routeMap: Record<string, RouteInfo> = {
  "": { title: "Dashboard", icon: LayoutDashboard },
  dashboard: { title: "Dashboard", icon: LayoutDashboard },
  files: { title: "Files", icon: FileText },
  folders: { title: "Folders", icon: FolderOpen },
  memories: { title: "Memories", icon: Database, parent: "memory-system" },
  "memory-categories": { title: "Memory Categories", icon: Tag, parent: "memory-system" },
  "memory-analytics": { title: "Memory Analytics", icon: BarChart2, parent: "memory-system" },
  "mem0-integration": { title: "Mem0 Integration", icon: Brain, parent: "memory-system" },
  "memory-system": { title: "Memory System", icon: Brain },
  "ai-family": { title: "AI Family", icon: Users },
  webhooks: { title: "Webhooks", icon: Bell },
  crewai: { title: "CrewAI", icon: Workflow },
  "api-hub": { title: "API Hub", icon: Globe },
  "api-keys": { title: "API Keys", icon: Key },
  "email-templates": { title: "Email Templates", icon: Mail },
  settings: { title: "Settings", icon: Settings },
  "file-editor": { title: "File Editor", icon: FileText, parent: "files" },
}

export function generateBreadcrumbs(path: string): BreadcrumbItem[] {
  // Remove leading and trailing slashes and split the path
  const segments = path.replace(/^\/|\/$/g, "").split("/")
  const breadcrumbs: BreadcrumbItem[] = []

  let currentPath = ""

  // Build breadcrumbs based on path segments
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    // Skip empty segments
    if (!segment) continue

    // Handle dynamic routes
    if (segment.startsWith("[") && segment.endsWith("]")) {
      // This is a dynamic segment like [fileId]
      const paramName = segment.slice(1, -1)
      const paramValue = segments[i]

      // Get the parent route info
      const parentSegment = segments[i - 1] || ""
      const routeInfo = routeMap[parentSegment]

      if (routeInfo) {
        currentPath += `/${paramValue}`
        breadcrumbs.push({
          title: `${paramName}: ${paramValue}`,
          href: currentPath,
          icon: routeInfo.icon,
        })
      }
      continue
    }

    currentPath += `/${segment}`

    // Get route info from the map
    const routeInfo = routeMap[segment]
    if (routeInfo) {
      // Check if this route has a parent that's not already in the breadcrumbs
      if (routeInfo.parent && !breadcrumbs.some((b) => b.href === `/${routeInfo.parent}`)) {
        const parentInfo = routeMap[routeInfo.parent]
        if (parentInfo) {
          breadcrumbs.push({
            title: parentInfo.title,
            href: `/${routeInfo.parent}`,
            icon: parentInfo.icon,
          })
        }
      }

      breadcrumbs.push({
        title: routeInfo.title,
        href: currentPath,
        icon: routeInfo.icon,
      })
    } else {
      // For unknown routes, just use the segment as the title
      breadcrumbs.push({
        title: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
        href: currentPath,
      })
    }
  }

  return breadcrumbs
}
