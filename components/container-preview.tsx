"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileIcon, FolderIcon, ChevronRight, Save, Eye, Code, ArrowLeft, Moon, Sun } from "lucide-react"
import { marked } from "marked"
import { cn } from "@/lib/utils"

interface ContainerFile {
  name: string
  type: "file" | "directory"
  path: string
}

interface ContainerPreviewProps {
  containerRef: any
  onNavigateBack?: () => void
}

export function ContainerPreview({ containerRef, onNavigateBack }: ContainerPreviewProps) {
  const [currentPath, setCurrentPath] = useState("/")
  const [files, setFiles] = useState<ContainerFile[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>("")
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<"file" | "preview">("file")
  const [isLoading, setIsLoading] = useState(true)
  const [breadcrumbs, setBreadcrumbs] = useState<{ name: string; path: string }[]>([{ name: "Root", path: "/" }])
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Load files from the current directory
  const loadFiles = async () => {
    if (!containerRef.current) return

    setIsLoading(true)
    try {
      const dirContents = await containerRef.current.listDirectory(currentPath)
      setFiles(dirContents)
    } catch (error) {
      console.error("Error loading files:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load file content
  const loadFileContent = async (path: string) => {
    if (!containerRef.current) return

    try {
      const content = await containerRef.current.readFile(path)
      setFileContent(content || "")
      setSelectedFile(path)

      // Set active tab based on file type
      if (path.endsWith(".md")) {
        setActiveTab("preview")
      } else {
        setActiveTab("file")
      }
    } catch (error) {
      console.error(`Error loading file content for ${path}:`, error)
      setFileContent(`Error loading file: ${error}`)
    }
  }

  // Save file content
  const saveFileContent = async () => {
    if (!containerRef.current || !selectedFile) return

    try {
      await containerRef.current.writeFile(selectedFile, fileContent)
      // Reload the file to confirm changes
      await loadFileContent(selectedFile)
    } catch (error) {
      console.error(`Error saving file ${selectedFile}:`, error)
    }
  }

  // Navigate to a directory
  const navigateToDirectory = (path: string) => {
    setCurrentPath(path)
    setSelectedFile(null)
    setFileContent("")

    // Update breadcrumbs
    const parts = path.split("/").filter(Boolean)
    const newBreadcrumbs = [{ name: "Root", path: "/" }]

    let currentBreadcrumbPath = ""
    for (const part of parts) {
      currentBreadcrumbPath += `/${part}`
      newBreadcrumbs.push({
        name: part,
        path: currentBreadcrumbPath,
      })
    }

    setBreadcrumbs(newBreadcrumbs)
  }

  // Handle file or directory click
  const handleItemClick = (item: ContainerFile) => {
    if (item.type === "directory") {
      navigateToDirectory(item.path)
    } else {
      loadFileContent(item.path)
    }
  }

  // Navigate to parent directory
  const navigateToParent = () => {
    if (currentPath === "/") return

    const parts = currentPath.split("/").filter(Boolean)
    parts.pop()
    const parentPath = parts.length === 0 ? "/" : `/${parts.join("/")}`
    navigateToDirectory(parentPath)
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Load files when component mounts or path changes
  useEffect(() => {
    if (containerRef.current) {
      loadFiles()
    }
  }, [currentPath, containerRef.current])

  // Render markdown content
  const renderMarkdown = () => {
    if (!fileContent) return "<p>No content to display</p>"
    try {
      return marked(fileContent)
    } catch (error) {
      return `<p>Error rendering markdown: ${error}</p>`
    }
  }

  // Determine if a file is a markdown file
  const isMarkdownFile = selectedFile?.toLowerCase().endsWith(".md")

  return (
    <div className={cn("flex flex-col h-full", isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900")}>
      {/* Header with breadcrumb navigation and dark mode toggle */}
      <div className="flex items-center justify-between mb-4 text-sm overflow-x-auto whitespace-nowrap pb-2">
        <div className="flex items-center">
          {currentPath !== "/" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToParent}
              className={cn("h-8 w-8 p-0 mr-1", isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateToDirectory(crumb.path)}
                className={cn("h-8 px-2 py-0", isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100")}
              >
                {crumb.name}
              </Button>
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarkMode}
          className={cn("h-8 w-8 p-0", isDarkMode ? "text-yellow-400" : "text-gray-600")}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      {/* File browser or file content */}
      {selectedFile ? (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null)
                  setFileContent("")
                }}
                className={cn("h-8 w-8 p-0 mr-1", isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{selectedFile.split("/").pop()}</span>
            </div>

            <div className="flex items-center space-x-2">
              {isMarkdownFile && (
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "file" | "preview")}>
                  <TabsList className={isDarkMode ? "bg-gray-800" : ""}>
                    <TabsTrigger value="file" className="flex items-center">
                      <Code className="h-4 w-4 mr-1" />
                      Edit
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={saveFileContent}
                className={cn("h-8", isDarkMode ? "bg-gray-800 hover:bg-gray-700 border-gray-700" : "")}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>

          {isMarkdownFile ? (
            <div className="flex-1 overflow-hidden">
              {activeTab === "file" ? (
                <Textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className={cn(
                    "h-full resize-none font-mono",
                    isDarkMode ? "bg-gray-800 text-gray-100 border-gray-700" : "",
                  )}
                />
              ) : (
                <ScrollArea
                  className={cn(
                    "h-full border rounded-md p-4",
                    isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white",
                  )}
                >
                  <div
                    className={cn("prose max-w-none", isDarkMode ? "prose-invert" : "")}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown() }}
                  />
                </ScrollArea>
              )}
            </div>
          ) : (
            <Textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className={cn(
                "flex-1 resize-none font-mono",
                isDarkMode ? "bg-gray-800 text-gray-100 border-gray-700" : "",
              )}
            />
          )}
        </div>
      ) : (
        <ScrollArea
          className={cn("flex-1 border rounded-md night-scrollbar", isDarkMode ? "border-gray-700 bg-gray-900" : "")}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full p-4">
              <div
                className={cn(
                  "animate-spin h-6 w-6 border-2 border-t-transparent rounded-full",
                  isDarkMode ? "border-gray-500" : "border-gray-300",
                )}
              ></div>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500">
              <p>No files in this directory</p>
            </div>
          ) : (
            <div className="p-2">
              {files.map((file) => (
                <div
                  key={file.path}
                  className={cn(
                    "flex items-center p-2 rounded-md cursor-pointer",
                    isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100",
                  )}
                  onClick={() => handleItemClick(file)}
                >
                  {file.type === "directory" ? (
                    <FolderIcon className="h-5 w-5 mr-2 text-blue-500" />
                  ) : (
                    <FileIcon className={cn("h-5 w-5 mr-2", isDarkMode ? "text-gray-400" : "text-gray-500")} />
                  )}
                  <span>{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  )
}
