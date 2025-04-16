import type * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  separator?: React.ReactNode
}

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {}

export interface BreadcrumbLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {}

export interface BreadcrumbSeparatorProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function Breadcrumb({ className, separator, ...props }: BreadcrumbProps) {
  return <nav aria-label="breadcrumb" className={cn("flex items-center text-sm", className)} {...props} />
}

export function BreadcrumbItem({ className, ...props }: BreadcrumbItemProps) {
  return <li className={cn("inline-flex items-center", className)} {...props} />
}

export function BreadcrumbLink({ className, ...props }: BreadcrumbLinkProps) {
  return <a className={cn("text-muted-foreground hover:text-foreground cursor-pointer", className)} {...props} />
}

export function BreadcrumbSeparator({ className, children, ...props }: BreadcrumbSeparatorProps) {
  return (
    <span className={cn("mx-1 text-muted-foreground", className)} {...props}>
      {children || <ChevronRight className="h-4 w-4" />}
    </span>
  )
}
