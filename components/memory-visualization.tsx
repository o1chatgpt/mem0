"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Memory {
  id: string
  memory: string
  created_at: string
  relevance?: number
}

interface MemoryVisualizationProps {
  memories: Memory[]
  currentQuery?: string
}

export function MemoryVisualization({ memories, currentQuery }: MemoryVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || memories.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Calculate positions
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const radius = Math.min(centerX, centerY) * 0.7

    // Draw current query node in the center if provided
    if (currentQuery) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(147, 51, 234, 0.7)" // Purple for current query
      ctx.fill()
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.closePath()

      ctx.font = "12px sans-serif"
      ctx.fillStyle = "#fff"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("Current", centerX, centerY - 5)
      ctx.fillText("Query", centerX, centerY + 10)
    }

    // Draw memory nodes
    memories.forEach((memory, index) => {
      const angle = (index / memories.length) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      // Calculate node size based on relevance
      const nodeSize = memory.relevance ? 10 + memory.relevance * 20 : 15

      // Draw connection line
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.strokeStyle = memory.relevance ? `rgba(59, 130, 246, ${memory.relevance})` : "rgba(156, 163, 175, 0.5)"
      ctx.lineWidth = memory.relevance ? 1 + memory.relevance * 3 : 1
      ctx.stroke()
      ctx.closePath()

      // Draw node
      ctx.beginPath()
      ctx.arc(x, y, nodeSize, 0, Math.PI * 2)
      ctx.fillStyle = memory.relevance
        ? `rgba(59, 130, 246, ${0.3 + memory.relevance * 0.5})`
        : "rgba(156, 163, 175, 0.5)"
      ctx.fill()
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.closePath()

      // Draw memory ID or short text
      ctx.font = "10px sans-serif"
      ctx.fillStyle = "#fff"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      const shortText = memory.memory.substring(0, 15) + "..."
      ctx.fillText(shortText, x, y)
    })
  }, [memories, currentQuery])

  if (memories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memory Connections</CardTitle>
          <CardDescription>Visualize how memories are connected</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No memories to visualize</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Connections</CardTitle>
        <CardDescription>Visualize how memories are connected</CardDescription>
      </CardHeader>
      <CardContent>
        <canvas ref={canvasRef} className="w-full h-[300px] rounded-md" style={{ background: "rgba(0, 0, 0, 0.03)" }} />
      </CardContent>
    </Card>
  )
}
