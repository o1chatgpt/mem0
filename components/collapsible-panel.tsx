"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useHotkeys } from "react-hotkeys-hook"

interface CollapsiblePanelProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
  minWidth?: number
  maxWidth?: number
  side?: "left" | "right"
  className?: string
}

export function CollapsiblePanel({
  children,
  defaultCollapsed = false,
  minWidth = 50,
  maxWidth = 400,
  side = "left",
  className = "",
}: CollapsiblePanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [width, setWidth] = useState(collapsed ? minWidth : 300)
  const [isDragging, setIsDragging] = useState(false)

  // Toggle collapsed state
  const toggleCollapsed = () => {
    if (collapsed) {
      setCollapsed(false)
      setWidth(300)
    } else {
      setCollapsed(true)
      setWidth(minWidth)
    }
  }

  // Handle keyboard shortcut
  useHotkeys(
    "ctrl+b, meta+b",
    () => {
      toggleCollapsed()
    },
    { enableOnFormTags: true },
  )

  // Handle mouse events for resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      let newWidth
      if (side === "left") {
        newWidth = e.clientX
      } else {
        newWidth = window.innerWidth - e.clientX
      }

      // Constrain width between min and max
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      if (width <= minWidth + 50) {
        setCollapsed(true)
        setWidth(minWidth)
      } else {
        setCollapsed(false)
      }
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, minWidth, maxWidth, width, side])

  return (
    <div
      className={`relative flex flex-col h-full transition-all duration-300 ${className}`}
      style={{ width: `${width}px` }}
    >
      {children}

      {/* Resize handle */}
      <div
        className={`absolute top-0 ${
          side === "left" ? "right-0" : "left-0"
        } h-full w-1 cursor-col-resize hover:bg-primary/20 ${isDragging ? "bg-primary/40" : ""}`}
        onMouseDown={handleMouseDown}
      />

      {/* Collapse/expand button */}
      <Button
        variant="ghost"
        size="icon"
        className={`absolute top-2 ${
          side === "left" ? "right-2" : "left-2"
        } h-6 w-6 rounded-full bg-background shadow-sm border`}
        onClick={toggleCollapsed}
      >
        {collapsed ? (
          <ChevronRight className={`h-4 w-4 ${side === "right" ? "rotate-180" : ""}`} />
        ) : (
          <ChevronLeft className={`h-4 w-4 ${side === "right" ? "rotate-180" : ""}`} />
        )}
      </Button>
    </div>
  )
}
