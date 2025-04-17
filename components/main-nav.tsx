"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
    },
    {
      href: "/ai-family",
      label: "AI Family",
      active: pathname === "/ai-family" || pathname.startsWith("/ai-family/"),
    },
    {
      href: "/voice-services",
      label: "Voice Services",
      active: pathname === "/voice-services",
    },
    {
      href: "/tools",
      label: "Tools",
      active: pathname === "/tools" || pathname.startsWith("/tools/"),
    },
    {
      href: "/settings",
      label: "Settings",
      active: pathname === "/settings",
    },
  ]

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-black dark:text-white" : "text-muted-foreground",
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
