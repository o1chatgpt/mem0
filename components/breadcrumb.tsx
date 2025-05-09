import type React from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/" className="text-muted-foreground hover:text-foreground flex items-center">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link
              href={item.href}
              className={cn(
                "ml-2 text-sm font-medium flex items-center",
                index === items.length - 1
                  ? "text-foreground pointer-events-none"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={index === items.length - 1 ? "page" : undefined}
            >
              {item.icon && <item.icon className="mr-2 h-4 w-4" />}
              {item.title}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
