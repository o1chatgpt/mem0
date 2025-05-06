"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CustomScrollArea } from "./custom-scroll-area"

interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "horizontal" | "vertical"
  defaultSize?: number
  minSize?: number
  maxSize?: number
  showScrollbar?: boolean
}

export function ResizablePanel({
  children,
  className,
  direction = "horizontal",
  defaultSize = 50,
  minSize = 20,
  maxSize = 80,
  showScrollbar = true,
  ...props
}: ResizablePanelProps) {
  const [size, setSize] = React.useState(defaultSize)
  const [isResizing, setIsResizing] = React.useState(false)
  const resizeRef = React.useRef<HTMLDivElement>(null)

  const startResizing = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const stopResizing = React.useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = React.useCallback(
    (e: MouseEvent) => {
      if (isResizing && resizeRef.current) {
        const rect = resizeRef.current.parentElement?.getBoundingClientRect()
        if (rect) {
          const newSize =
            direction === "horizontal"
              ? ((e.clientX - rect.left) / rect.width) * 100
              : ((e.clientY - rect.top) / rect.height) * 100

          const clampedSize = Math.max(minSize, Math.min(maxSize, newSize))
          setSize(clampedSize)
        }
      }
    },
    [isResizing, direction, minSize, maxSize],
  )

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize)
      window.addEventListener("mouseup", stopResizing)
    }

    return () => {
      window.removeEventListener("mousemove", resize)
      window.removeEventListener("mouseup", stopResizing)
    }
  }, [isResizing, resize, stopResizing])

  return (
    <div className={cn("relative flex", direction === "horizontal" ? "flex-row" : "flex-col", className)} {...props}>
      <CustomScrollArea
        className={cn(
          "overflow-anchor-auto",
          direction === "horizontal"
            ? `w-[${size}%] min-w-[${minSize}%] max-w-[${maxSize}%]`
            : `h-[${size}%] min-h-[${minSize}%] max-h-[${maxSize}%]`,
        )}
        showScrollbar={showScrollbar}
      >
        {children}
      </CustomScrollArea>
      <div
        ref={resizeRef}
        className={cn(
          "flex items-center justify-center bg-border hover:bg-primary/20 active:bg-primary/40 cursor-col-resize",
          direction === "horizontal" ? "w-1 h-full cursor-col-resize" : "h-1 w-full cursor-row-resize",
        )}
        onMouseDown={startResizing}
      />
    </div>
  )
}
