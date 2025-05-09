"use client"

import { useRef, useEffect, useState } from "react"
import { ForceGraph2D } from "react-force-graph"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Search, ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import type { Memory } from "@/lib/mem0"

interface MemoryNode {
  id: string
  name: string
  val: number
  group: number
  color?: string
}

interface MemoryLink {
  source: string
  target: string
  value: number
}

interface GraphData {
  nodes: MemoryNode[]
  links: MemoryLink[]
}

interface MemoryRelationshipGraphProps {
  memories: Memory[]
}

export default function MemoryRelationshipGraph({ memories }: MemoryRelationshipGraphProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })
  const [searchTerm, setSearchTerm] = useState("")
  const [linkDistance, setLinkDistance] = useState(100)
  const [highlightNodes, setHighlightNodes] = useState(new Set())
  const [highlightLinks, setHighlightLinks] = useState(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const graphRef = useRef<any>()

  // Process memories into graph data
  useEffect(() => {
    if (!memories || memories.length === 0) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      // Create nodes from memories
      const nodes: MemoryNode[] = memories.map((memory, index) => {
        // Determine group based on memory type or other attributes
        const group = determineMemoryGroup(memory)

        return {
          id: memory.id,
          name: memory.content.substring(0, 30) + (memory.content.length > 30 ? "..." : ""),
          val: calculateMemoryValue(memory),
          group,
          color: getGroupColor(group),
        }
      })

      // Create links between related memories
      const links: MemoryLink[] = []

      // Find relationships between memories based on content similarity, tags, etc.
      memories.forEach((memory, i) => {
        // This is a simplified approach - in a real implementation, you'd use more
        // sophisticated methods to determine relationships
        for (let j = i + 1; j < memories.length; j++) {
          const otherMemory = memories[j]
          const relationshipStrength = calculateRelationshipStrength(memory, otherMemory)

          if (relationshipStrength > 0) {
            links.push({
              source: memory.id,
              target: otherMemory.id,
              value: relationshipStrength,
            })
          }
        }
      })

      setGraphData({ nodes, links })
    } catch (error) {
      console.error("Error processing memory data for visualization:", error)
    } finally {
      setIsLoading(false)
    }
  }, [memories])

  // Handle search
  useEffect(() => {
    if (!searchTerm) {
      setHighlightNodes(new Set())
      setHighlightLinks(new Set())
      return
    }

    const term = searchTerm.toLowerCase()
    const matchedNodes = new Set()

    // Find nodes that match the search term
    graphData.nodes.forEach((node) => {
      if (node.name.toLowerCase().includes(term)) {
        matchedNodes.add(node.id)
      }
    })

    // Find links connected to matched nodes
    const connectedLinks = new Set()
    graphData.links.forEach((link) => {
      if (matchedNodes.has(link.source) || matchedNodes.has(link.target)) {
        connectedLinks.add(link)
        matchedNodes.add(link.source)
        matchedNodes.add(link.target)
      }
    })

    setHighlightNodes(matchedNodes)
    setHighlightLinks(connectedLinks)
  }, [searchTerm, graphData])

  // Helper functions
  function determineMemoryGroup(memory: Memory): number {
    // Simplified grouping logic - in a real implementation, you'd use more
    // sophisticated methods to determine groups
    if (memory.type === "episodic") return 1
    if (memory.type === "semantic") return 2
    if (memory.type === "procedural") return 3
    return 0
  }

  function calculateMemoryValue(memory: Memory): number {
    // Calculate node size based on memory importance, length, etc.
    return Math.max(1, Math.min(10, memory.content.length / 100))
  }

  function getGroupColor(group: number): string {
    const colors = ["#ff6b6b", "#48dbfb", "#1dd1a1", "#feca57", "#54a0ff"]
    return colors[group % colors.length]
  }

  function calculateRelationshipStrength(memory1: Memory, memory2: Memory): number {
    // Simplified relationship calculation - in a real implementation, you'd use
    // more sophisticated methods like semantic similarity

    // Check for common words
    const words1 = new Set(memory1.content.toLowerCase().split(/\s+/))
    const words2 = new Set(memory2.content.toLowerCase().split(/\s+/))

    let commonWords = 0
    words1.forEach((word) => {
      if (words2.has(word) && word.length > 3) {
        commonWords++
      }
    })

    // Check for same type
    const sameType = memory1.type === memory2.type ? 1 : 0

    // Calculate final strength
    const strength = commonWords * 0.2 + sameType * 0.5

    // Only return a link if there's a meaningful relationship
    return strength > 0.5 ? strength : 0
  }

  // Zoom controls
  const handleZoomIn = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom()
      graphRef.current.zoom(currentZoom * 1.2, 400)
    }
  }

  const handleZoomOut = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom()
      graphRef.current.zoom(currentZoom * 0.8, 400)
    }
  }

  const handleReset = () => {
    if (graphRef.current) {
      graphRef.current.centerAt(0, 0, 1000)
      graphRef.current.zoom(1, 1000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p>Building visualization...</p>
        </div>
      </div>
    )
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-medium">No memory data available</p>
          <p className="text-muted-foreground">Add some memories to visualize their relationships</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {/* Search and controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 bg-background/80 p-2 rounded-md backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search memories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-[200px]"
          />
        </div>
        <Button size="icon" variant="outline" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" onClick={handleReset} title="Reset View">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Link distance control */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-background/80 p-2 rounded-md backdrop-blur-sm">
        <span className="text-sm">Link Distance:</span>
        <Slider
          value={[linkDistance]}
          min={50}
          max={300}
          step={10}
          onValueChange={(value) => setLinkDistance(value[0])}
          className="w-[150px]"
        />
      </div>

      {/* Graph */}
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={(node: any) =>
          highlightNodes.size > 0 ? (highlightNodes.has(node.id) ? node.color : "rgba(160, 160, 160, 0.3)") : node.color
        }
        linkColor={(link: any) =>
          highlightLinks.size > 0 ? (highlightLinks.has(link) ? "#999" : "rgba(160, 160, 160, 0.1)") : "#999"
        }
        linkWidth={(link: any) => (highlightLinks.size > 0 ? (highlightLinks.has(link) ? 2 : 0.5) : 1)}
        nodeRelSize={6}
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={2}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.1}
        cooldownTime={2000}
        linkDistance={linkDistance}
        onNodeClick={(node: any) => {
          // Handle node click - could show details, etc.
          console.log("Clicked node:", node)
        }}
        width={window.innerWidth - 100}
        height={600}
      />
    </div>
  )
}
