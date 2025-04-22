"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Home,
  Users,
  Settings,
  FileText,
  PenToolIcon as Tool,
  Database,
  Code,
  Menu,
  X,
  CreditCard,
  Briefcase,
  Brain,
  TestTube,
} from "lucide-react"
import { useState } from "react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "AI Family",
    href: "/ai-family",
    icon: Users,
  },
  {
    title: "Mem0 Chat",
    href: "/mem0-chat",
    icon: Brain,
  },
  {
    title: "Memory Testing",
    href: "/memory-testing",
    icon: TestTube,
  },
  {
    title: "Cards",
    href: "/cards",
    icon: CreditCard,
  },
  {
    title: "CrewAI",
    href: "/crew-ai",
    icon: Briefcase,
  },
  {
    title: "Tools",
    href: "/tools",
    icon: Tool,
  },
  {
    title: "Files",
    href: "/files",
    icon: FileText,
  },
  {
    title: "Database",
    href: "/database",
    icon: Database,
  },
  {
    title: "Code Editor",
    href: "/code-editor",
    icon: Code,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-all duration-100 md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r bg-background transition-transform duration-200 md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-xl">File Manager</span>
          </Link>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="px-3 py-4">
            <nav className="flex flex-col gap-1">
              {sidebarItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href || pathname?.startsWith(`${item.href}/`) ? "secondary" : "ghost"}
                  className="justify-start"
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              ))}
            </nav>
          </div>
        </ScrollArea>
      </aside>
    </>
  )
}
