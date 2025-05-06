"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface CustomScrollbarProps {
  children: React.ReactNode
  className?: string
  showOnlyOnOverflow?: boolean
  direction?: "vertical" | "horizontal" | "both"
  thumbClassName?: string
  trackClassName?: string
}

export function CustomScrollbar({
  children,
  className,
  showOnlyOnOverflow = true,
  direction = "vertical",
  thumbClassName,
  trackClassName,
}: CustomScrollbarProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const scrollTrackVerticalRef = useRef<HTMLDivElement>(null)
  const scrollThumbVerticalRef = useRef<HTMLDivElement>(null)
  const scrollTrackHorizontalRef = useRef<HTMLDivElement>(null)
  const scrollThumbHorizontalRef = useRef<HTMLDivElement>(null)
  const observer = useRef<ResizeObserver | null>(null)
  const [showVerticalScrollbar, setShowVerticalScrollbar] = useState(false)
  const [showHorizontalScrollbar, setShowHorizontalScrollbar] = useState(false)
  const [isDraggingVertical, setIsDraggingVertical] = useState(false)
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false)
  const [startY, setStartY] = useState(0)
  const [startX, setStartX] = useState(0)
  const [startTop, setStartTop] = useState(0)
  const [startLeft, setStartLeft] = useState(0)

  // Check if content overflows and update scrollbar visibility
  const checkOverflow = () => {
    if (!contentRef.current) return

    const { scrollHeight, clientHeight, scrollWidth, clientWidth } = contentRef.current

    if (direction === "vertical" || direction === "both") {
      setShowVerticalScrollbar(scrollHeight > clientHeight)
    }

    if (direction === "horizontal" || direction === "both") {
      setShowHorizontalScrollbar(scrollWidth > clientWidth)
    }
  }

  // Update scrollbar thumb size and position
  const updateScrollbarThumb = () => {
    if (
      !contentRef.current ||
      (direction === "vertical" && !scrollTrackVerticalRef.current) ||
      (direction === "horizontal" && !scrollTrackHorizontalRef.current)
    )
      return

    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = contentRef.current

    // Update vertical scrollbar
    if (direction === "vertical" || direction === "both") {
      const trackHeight = scrollTrackVerticalRef.current?.clientHeight || 0
      const thumbHeight = Math.max(
        (clientHeight / scrollHeight) * trackHeight,
        30, // Minimum thumb height
      )
      const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * (trackHeight - thumbHeight)

      if (scrollThumbVerticalRef.current) {
        scrollThumbVerticalRef.current.style.height = `${thumbHeight}px`
        scrollThumbVerticalRef.current.style.transform = `translateY(${thumbTop}px)`
      }
    }

    // Update horizontal scrollbar
    if (direction === "horizontal" || direction === "both") {
      const trackWidth = scrollTrackHorizontalRef.current?.clientWidth || 0
      const thumbWidth = Math.max(
        (clientWidth / scrollWidth) * trackWidth,
        30, // Minimum thumb width
      )
      const thumbLeft = (scrollLeft / (scrollWidth - clientWidth)) * (trackWidth - thumbWidth)

      if (scrollThumbHorizontalRef.current) {
        scrollThumbHorizontalRef.current.style.width = `${thumbWidth}px`
        scrollThumbHorizontalRef.current.style.transform = `translateX(${thumbLeft}px)`
      }
    }
  }

  // Handle scroll event
  const handleScroll = () => {
    updateScrollbarThumb()
  }

  // Handle vertical thumb drag start
  const handleVerticalThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDraggingVertical(true)
    setStartY(e.clientY)
    if (scrollThumbVerticalRef.current) {
      setStartTop(scrollThumbVerticalRef.current.getBoundingClientRect().top)
    }
  }

  // Handle horizontal thumb drag start
  const handleHorizontalThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDraggingHorizontal(true)
    setStartX(e.clientX)
    if (scrollThumbHorizontalRef.current) {
      setStartLeft(scrollThumbHorizontalRef.current.getBoundingClientRect().left)
    }
  }

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!contentRef.current) return

      // Handle vertical dragging
      if (isDraggingVertical && scrollTrackVerticalRef.current && scrollThumbVerticalRef.current) {
        const deltaY = e.clientY - startY
        const trackRect = scrollTrackVerticalRef.current.getBoundingClientRect()
        const thumbHeight = scrollThumbVerticalRef.current.clientHeight

        const newTop = Math.max(0, Math.min(startTop + deltaY - trackRect.top, trackRect.height - thumbHeight))
        const scrollRatio = newTop / (trackRect.height - thumbHeight)

        contentRef.current.scrollTop = scrollRatio * (contentRef.current.scrollHeight - contentRef.current.clientHeight)
      }

      // Handle horizontal dragging
      if (isDraggingHorizontal && scrollTrackHorizontalRef.current && scrollThumbHorizontalRef.current) {
        const deltaX = e.clientX - startX
        const trackRect = scrollTrackHorizontalRef.current.getBoundingClientRect()
        const thumbWidth = scrollThumbHorizontalRef.current.clientWidth

        const newLeft = Math.max(0, Math.min(startLeft + deltaX - trackRect.left, trackRect.width - thumbWidth))
        const scrollRatio = newLeft / (trackRect.width - thumbWidth)

        contentRef.current.scrollLeft = scrollRatio * (contentRef.current.scrollWidth - contentRef.current.clientWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDraggingVertical(false)
      setIsDraggingHorizontal(false)
    }

    if (isDraggingVertical || isDraggingHorizontal) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDraggingVertical, isDraggingHorizontal, startY, startX, startTop, startLeft])

  // Initialize and cleanup
  useEffect(() => {
    const currentRef = contentRef.current

    if (currentRef) {
      // Initial check and setup
      checkOverflow()
      updateScrollbarThumb()

      // Add scroll event listener
      currentRef.addEventListener("scroll", handleScroll)

      // Setup resize observer
      observer.current = new ResizeObserver(() => {
        checkOverflow()
        updateScrollbarThumb()
      })

      observer.current.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", handleScroll)
      }

      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [])

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        ref={contentRef}
        className="h-full w-full overflow-auto scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {children}
      </div>

      {/* Vertical scrollbar */}
      {(direction === "vertical" || direction === "both") && (
        <div
          ref={scrollTrackVerticalRef}
          className={cn(
            "absolute top-0 right-0 bottom-0 w-2 transition-opacity duration-300",
            !showOnlyOnOverflow || showVerticalScrollbar ? "opacity-100" : "opacity-0 pointer-events-none",
            trackClassName,
          )}
        >
          <div
            ref={scrollThumbVerticalRef}
            className={cn(
              "absolute top-0 right-0 w-2 rounded-full bg-gray-400/30 hover:bg-gray-400/50 active:bg-gray-400/70 cursor-pointer",
              thumbClassName,
            )}
            onMouseDown={handleVerticalThumbMouseDown}
          />
        </div>
      )}

      {/* Horizontal scrollbar */}
      {(direction === "horizontal" || direction === "both") && (
        <div
          ref={scrollTrackHorizontalRef}
          className={cn(
            "absolute left-0 right-0 bottom-0 h-2 transition-opacity duration-300",
            !showOnlyOnOverflow || showHorizontalScrollbar ? "opacity-100" : "opacity-0 pointer-events-none",
            trackClassName,
          )}
        >
          <div
            ref={scrollThumbHorizontalRef}
            className={cn(
              "absolute bottom-0 left-0 h-2 rounded-full bg-gray-400/30 hover:bg-gray-400/50 active:bg-gray-400/70 cursor-pointer",
              thumbClassName,
            )}
            onMouseDown={handleHorizontalThumbMouseDown}
          />
        </div>
      )}
    </div>
  )
}
