"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Loader2, Play, Upload, FileCode, Save, TerminalIcon, AlertTriangle, Key } from "lucide-react"
import { WebContainerManager } from "@/components/web-container-manager"
import { FileExplorer } from "@/components/file-explorer"
import { Terminal } from "@/components/terminal"
import { CollapsibleFooter } from "@/components/collapsible-footer"
import type { FileSystemItem, FileType } from "@/types/file-system"
import {
  createItem,
  deleteItem,
  getItemByPath,
  updateFileContent,
  getFilesForWebContainer,
  getDirectoryChildren,
  moveItem,
} from "@/lib/file-system-utils"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { UserNav } from "@/components/user-nav"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Home() {
  // Skip the protected route wrapper for now
  // const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isContainerReady, setIsContainerReady] = useState(false)
  const [isSimulated, setIsSimulated] = useState(false)
  const [output, setOutput] = useState<string>("")
  const [terminalOutput, setTerminalOutput] = useState<string>("")
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([])
  const [currentPath, setCurrentPath] = useState<string>("/")
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>("")
  const [activeTab, setActiveTab] = useState("editor")
  const containerRef = useRef<any>(null)
  const [isCrossOriginIsolated, setIsCrossOriginIsolated] = useState<boolean>(false)
  const [authStatus, setAuthStatus] = useState<string>("initializing")

  // Check if cross-origin isolation is enabled
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsCrossOriginIsolated(!!(window as any).crossOriginIsolated)
    }
  }, [])

  // Get current directory items based on the current path
  const currentDirectoryItems = getDirectoryChildren(fileSystem, currentPath)

  const handleSelectItem = (path: string) => {
    const item = getItemByPath(fileSystem, path)
    if (item && item.type === "file") {
      setSelectedItem(path)
      setFileContent(item.content || "")
      setActiveTab("editor")
    }
  }

  const handleNavigate = (path: string) => {
    setCurrentPath(path)
    setSelectedItem(null)
  }

  const handleFileContentChange = (content: string) => {
    setFileContent(content)
    if (selectedItem) {
      setFileSystem(updateFileContent(fileSystem, selectedItem, content))
    }
  }

  const handleCreateItem = (name: string, type: FileType) => {
    if (!name) return

    setFileSystem(createItem(fileSystem, currentPath, name, type))

    // If it's a file, select it
    if (type === "file") {
      const newPath = currentPath === "/" ? `/${name}` : `${currentPath}/${name}`
      setSelectedItem(newPath)
      setFileContent("")
      setActiveTab("editor")
    }
  }

  const handleDeleteItem = (path: string) => {
    if (!path) return

    setFileSystem(deleteItem(fileSystem, path))

    if (selectedItem === path) {
      setSelectedItem(null)
      setFileContent("")
    }
  }

  const handleMoveItem = (sourcePath: string, targetPath: string) => {
    // Get the source and target items
    const sourceItem = getItemByPath(fileSystem, sourcePath)
    const targetItem = getItemByPath(fileSystem, targetPath)

    if (!sourceItem || !targetItem) return

    // Check if target is a directory
    if (targetItem.type !== "directory") return

    // Check if source is already in the target directory
    const sourceParentPath = sourcePath.split("/").slice(0, -1).join("/") || "/"
    if (sourceParentPath === targetPath) return

    // Move the item
    const updatedFileSystem = moveItem(fileSystem, sourcePath, targetPath)
    setFileSystem(updatedFileSystem)

    // Update selected item path if it was moved
    if (selectedItem === sourcePath) {
      const newPath = targetPath === "/" ? `/${sourceItem.name}` : `${targetPath}/${sourceItem.name}`
      setSelectedItem(newPath)
    }

    // Show success toast
    toast({
      title: "Item moved",
      description: `${sourceItem.name} moved to ${targetPath === "/" ? "root" : targetPath}`,
      duration: 3000,
    })
  }

  const handleContainerReady = (container: any) => {
    containerRef.current = container
    setIsContainerReady(true)
    setIsLoading(false)
    setIsSimulated(container.isSimulated || false)
    setAuthStatus(container.authStatus || (container.isSimulated ? "failed" : "success"))

    if (container.isSimulated) {
      setOutput("WebContainer is running in simulation mode with limited functionality.")
    } else {
      setOutput("WebContainer is ready. You can now run your code.")
      setTerminalOutput("WebContainer terminal ready. Type commands below.\n$ ")
    }
  }

  const handleTerminalOutput = (output: string) => {
    setTerminalOutput(output)
  }

  const handleSendCommand = async (command: string) => {
    if (!containerRef.current) {
      setTerminalOutput((prev) => prev + "Error: WebContainer not initialized\n")
      return
    }

    try {
      await containerRef.current.sendCommand(command)
    } catch (error) {
      console.error("Error sending command:", error)
      setTerminalOutput(
        (prev) => prev + `Error executing command: ${error instanceof Error ? error.message : String(error)}\n`,
      )
    }
  }

  const handleClearTerminal = () => {
    if (!containerRef.current) return
    containerRef.current.clearTerminal()
  }

  const handleRunContainer = async () => {
    if (!containerRef.current || fileSystem.length === 0) return

    setOutput("Running container...")
    try {
      // Convert the file system to a flat object for WebContainer
      const files = getFilesForWebContainer(fileSystem)
      await containerRef.current.loadFiles(files)
      const result = await containerRef.current.run()
      setOutput((prev) => prev + "\n" + result)
    } catch (error) {
      setOutput((prev) => prev + "\n" + "Error: " + (error as Error).message)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList) return

    setIsLoading(true)
    let filesProcessed = 0

    Array.from(fileList).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          // Create the file in the current directory
          setFileSystem((prev) => createItem(prev, currentPath, file.name, "file", event.target?.result as string))
        }
        filesProcessed++

        if (filesProcessed === fileList.length) {
          setIsLoading(false)
          setOutput("Files uploaded successfully.")
        }
      }
      reader.readAsText(file)
    })
  }

  // Directly render the content without the ProtectedRoute wrapper
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">WebContainer Manager</h1>
            {isSimulated && (
              <span className="ml-3 text-xs bg-yellow-600 text-white px-2 py-1 rounded-md flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Simulation Mode
              </span>
            )}
            {authStatus === "success" && !isSimulated && (
              <span className="ml-3 text-xs bg-green-600 text-white px-2 py-1 rounded-md flex items-center">
                <Key className="h-3 w-3 mr-1" />
                Authenticated
              </span>
            )}
            {authStatus === "failed" && !isSimulated && (
              <span className="ml-3 text-xs bg-red-600 text-white px-2 py-1 rounded-md flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Auth Failed
              </span>
            )}
          </div>
          <UserNav />
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 pb-[calc(4rem+64px)]">
        {isSimulated && (
          <Alert variant="warning" className="mb-4 bg-yellow-50 border-yellow-200 text-yellow-800">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertTitle>Running in Simulation Mode</AlertTitle>
            <AlertDescription>
              <p>
                WebContainer is running in simulation mode with limited functionality. Some features may not work as
                expected.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>File Explorer</CardTitle>
            </CardHeader>
            <CardContent>
              <FileExplorer
                items={currentDirectoryItems}
                currentPath={currentPath}
                selectedItem={selectedItem}
                onSelectItem={handleSelectItem}
                onCreateItem={handleCreateItem}
                onDeleteItem={handleDeleteItem}
                onNavigate={handleNavigate}
                onMoveItem={handleMoveItem}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="relative">
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                  <Input
                    type="file"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                  />
                </Button>
              </div>
              <Button
                onClick={handleRunContainer}
                disabled={!isContainerReady || fileSystem.length === 0}
                className={isSimulated ? "bg-yellow-600 hover:bg-yellow-700" : ""}
              >
                <Play className="mr-2 h-4 w-4" />
                {isSimulated ? "Run (Simulated)" : "Run"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="output">Output</TabsTrigger>
                  <TabsTrigger value="terminal">
                    <TerminalIcon className="mr-2 h-4 w-4" />
                    Terminal
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="min-h-[60vh]">
                <TabsContent value="editor" className="h-full">
                  {selectedItem ? (
                    <div className="flex flex-col h-full">
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 mb-2 rounded flex items-center">
                        <FileCode className="mr-2 h-4 w-4" />
                        <span className="text-sm font-mono">{selectedItem}</span>
                      </div>
                      <Textarea
                        value={fileContent}
                        onChange={(e) => handleFileContentChange(e.target.value)}
                        className="flex-1 font-mono resize-none h-[calc(60vh-4rem)]"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">Select a file to edit</div>
                  )}
                </TabsContent>
                <TabsContent value="output" className="h-full">
                  <Textarea
                    value={output}
                    readOnly
                    className="w-full h-[calc(60vh-2rem)] font-mono resize-none bg-black text-green-400 p-4"
                  />
                </TabsContent>
                <TabsContent value="terminal" className="h-full">
                  <Terminal
                    isReady={isContainerReady}
                    onSendCommand={handleSendCommand}
                    output={terminalOutput}
                    onClearTerminal={handleClearTerminal}
                    isSimulated={isSimulated}
                  />
                </TabsContent>
              </CardContent>
              <CardFooter className="flex justify-between">
                {selectedItem && activeTab === "editor" && (
                  <Button variant="outline" onClick={() => handleFileContentChange(fileContent)}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                )}
                {isLoading && (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                )}
              </CardFooter>
            </Tabs>
          </Card>
        </div>
      </main>

      <CollapsibleFooter containerRef={containerRef} />

      <WebContainerManager onReady={handleContainerReady} onTerminalOutput={handleTerminalOutput} />
      <Toaster />
    </div>
  )
}
