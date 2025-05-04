"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Maximize2, Minimize2, X, RefreshCw, ArrowLeft, ArrowRight, Folder } from "lucide-react"
import { cn } from "@/lib/utils"
import { ContainerPreview } from "@/components/container-preview"

type FooterState = "minimized" | "default" | "maximized"

interface CollapsibleFooterProps {
  containerRef: React.MutableRefObject<any>
}

export function CollapsibleFooter({ containerRef }: CollapsibleFooterProps) {
  const [footerState, setFooterState] = useState<FooterState>("default")
  const [url, setUrl] = useState<string>("/container-preview")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const [containerContent, setContainerContent] = useState<string>("")

  const footerHeight = {
    minimized: "h-10",
    default: "h-64",
    maximized: "h-[calc(100vh-4rem)]",
  }

  const handleMaximize = () => {
    setFooterState("maximized")
  }

  const handleMinimize = () => {
    setFooterState("minimized")
  }

  const handleRestore = () => {
    setFooterState("default")
  }

  const handleNavigate = (newUrl: string) => {
    setIsLoading(true)

    // Add http:// if not present and it's not our special container URL
    if (!newUrl.startsWith("/") && !newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
      newUrl = "https://" + newUrl
    }

    setUrl(newUrl)

    // Update history
    if (historyIndex < history.length - 1) {
      // If we're not at the end of history, truncate it
      setHistory([...history.slice(0, historyIndex + 1), newUrl])
      setHistoryIndex(historyIndex + 1)
    } else {
      // Otherwise just append
      setHistory([...history, newUrl])
      setHistoryIndex(history.length)
    }
  }

  const handleRefresh = () => {
    setIsLoading(true)
    if (url.startsWith("/container-preview")) {
      // No need to refresh container preview as it's reactive
      setIsLoading(false)
    } else if (iframeRef.current) {
      iframeRef.current.src = url
    }
  }

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setUrl(history[historyIndex - 1])
      setIsLoading(true)
    }
  }

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setUrl(history[historyIndex + 1])
      setIsLoading(true)
    }
  }

  const handleHome = () => {
    handleNavigate("/container-preview")
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleNavigate(url)
  }

  // Generate a preview of the container's file system
  const generateContainerPreview = async () => {
    setIsLoading(true)

    try {
      // Fetch the container file system data from the API
      const response = await fetch("/api/container-files")
      const files = await response.json()

      // Generate HTML to display the file system
      const fileListHtml =
        files.length > 0
          ? files
              .map(
                (file) => `
          <li class="file-item">
            <span class="file-icon ${file.type === "directory" ? "folder" : "file"}">
              ${file.type === "directory" ? "📁" : "📄"}
            </span>
            <span>${file.name}</span>
          </li>
        `,
              )
              .join("")
          : ""

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>WebContainer File System</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                padding: 20px;
                background-color: #f9f9f9;
                color: #333;
              }
              h1 {
                border-bottom: 1px solid #ddd;
                padding-bottom: 10px;
                font-size: 24px;
              }
              .file-list {
                list-style-type: none;
                padding: 0;
              }
              .file-item {
                padding: 8px 10px;
                margin: 4px 0;
                background-color: #fff;
                border-radius: 4px;
                border: 1px solid #eee;
                display: flex;
                align-items: center;
              }
              .file-item:hover {
                background-color: #f0f0f0;
              }
              .file-icon {
                margin-right: 10px;
                color: #666;
              }
              .folder {
                color: #2563eb;
              }
              .file {
                color: #64748b;
              }
              .empty-message {
                text-align: center;
                padding: 40px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <h1>WebContainer File System</h1>
            <div id="file-system">
              ${
                files.length > 0
                  ? `<ul class="file-list">${fileListHtml}</ul>`
                  : `<div class="empty-message">
                    <p>No files have been created yet.</p>
                    <p>Use the File Explorer to create and manage files.</p>
                  </div>`
              }
            </div>
          </body>
        </html>
      `

      setContainerContent(html)
    } catch (error) {
      console.error("Error fetching container files:", error)
      setContainerContent(`
        <div style="padding: 20px; color: red;">
          <h2>Error loading container files</h2>
          <p>Could not load the file system preview. Please try again later.</p>
        </div>
      `)
    }

    setIsLoading(false)
  }

  // Initialize history with the default URL
  useEffect(() => {
    if (history.length === 0) {
      setHistory([url])
      setHistoryIndex(0)
      generateContainerPreview()
    }
  }, [history, url])

  useEffect(() => {
    if (history.length === 0) {
      setHistory([url])
      setHistoryIndex(0)
    }
  }, [history, url])

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-background border-t transition-all duration-300 ease-in-out z-50",
        footerHeight[footerState],
      )}
    >
      <div className="flex items-center justify-between p-2 border-b bg-muted/40">
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleBack} disabled={historyIndex <= 0}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleRefresh}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleHome}>
            <Folder className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleUrlSubmit} className="flex-1 mx-2">
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-7 text-xs"
            placeholder="Enter URL or path"
            disabled={footerState === "minimized"}
          />
        </form>

        <div className="flex items-center space-x-1">
          {footerState === "minimized" ? (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleRestore}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          ) : footerState === "maximized" ? (
            <>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleRestore}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleMinimize}>
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleMaximize}>
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleMinimize}>
                <Minimize2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {footerState !== "minimized" && (
        <div className="w-full h-[calc(100%-2.5rem)] bg-white">
          {url.startsWith("/container-preview") ? (
            <div className="w-full h-full p-4">
              <ContainerPreview containerRef={containerRef} />
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              src={url}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              sandbox="allow-scripts allow-same-origin allow-forms"
              title="Embedded Browser"
            />
          )}
        </div>
      )}
    </div>
  )
}
