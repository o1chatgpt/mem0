"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CustomScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal"
  showScrollbar?: boolean
}

const CustomScrollArea = React.forwardRef<HTMLDivElement, CustomScrollAreaProps>(
  ({ className, children, orientation = "vertical", showScrollbar = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", orientation === "horizontal" ? "h-full" : "w-full", className)}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full overflow-auto",
            showScrollbar ? "" : "scrollbar-hide",
            orientation === "horizontal" ? "overflow-x-auto" : "overflow-y-auto",
          )}
        >
          {children}
        </div>
      </div>
    )
  },
)

CustomScrollArea.displayName = "CustomScrollArea"

export { CustomScrollArea }
