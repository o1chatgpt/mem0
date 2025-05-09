import type { LucideIcon } from "lucide-react"

export interface SidebarNavItem {
  title: string
  href: string
  icon: LucideIcon
  variant?: "default" | "ghost"
  color?: string
  children?: {
    title: string
    href: string
    icon?: LucideIcon
  }[]
}
