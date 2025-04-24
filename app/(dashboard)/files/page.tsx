"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, FolderOpen, Clock, Upload, Search, Filter, Grid, List } from "lucide-react"
import { SetupMem0Button } from "@/components/setup-mem0-button"

// Mock files data - in a real app, this would come from your database
const mockFiles = [
  {
    id: "file1",
    name: "Project Proposal.docx",
    type: "document",
    size: "2.4 MB",
    created: "2023-10-15T14:30:00Z",
    modified: "2023-10-20T09:15:00Z",
  },
  {
    id: "file2",
    name: "Budget Spreadsheet.xlsx",
    type: "spreadsheet",
    size: "1.8 MB",
    created: "2023-09-05T11:20:00Z",
    modified: "2023-10-18T16:45:00Z",
  },
  {
    id: "file3",
    name: "Presentation.pptx",
    type: "presentation",
    size: "5.2 MB",
    created: "2023-10-10T08:00:00Z",
    modified: "2023-10-21T13:30:00Z",
  },
  {
    id: "file4",
    name: "Meeting Notes.txt",
    type: "text",
    size: "12 KB",
    created: "2023-10-22T15:00:00Z",
    modified: "2023-10-22T15:00:00Z",
  },
  {
    id: "file5",
    name: "Logo Design.png",
    type: "image",
    size: "1.2 MB",
    created: "2023-10-05T10:30:00Z",
    modified: "2023-10-05T10:30:00Z",
  },
]

// Mock folders data
const mockFolders = [
  {
    id: "folder1",
    name: "Projects",
    files: 12,
    created: "2023-09-01T09:00:00Z",
  },
  {
    id: "folder2",
    name: "Documents",
    files: 8,
    created: "2023-09-15T11:30:00Z",
  },
  {
    id: "folder3",
    name: "Images",
    files: 24,
    created: "2023-10-02T14:15:00Z",
  },
]

export default function FilesPage() {
  const [view, setView] = useState("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [mem0Enabled, setMem0Enabled] = useState(true) // For demo purposes, assume Mem0 is enabled

  // Filter files based on search query
  const filteredFiles = mockFiles.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Files</h1>
          <p className="text-lg text-muted-foreground">Manage your files and documents</p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>

      {!mem0Enabled && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enable Mem0 Integration</CardTitle>
            <CardDescription>Enhance your file management with Mem0's long-term memory capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Mem0 provides enhanced memory capabilities for your files, allowing you to store and retrieve notes,
              comments, and important information about your files across sessions.
            </p>
            <SetupMem0Button />
          </CardContent>
        </Card>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant={view === "grid" ? "default" : "outline"} size="icon" onClick={() => setView("grid")}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={view === "list" ? "default" : "outline"} size="icon" onClick={() => setView("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {view === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {mockFolders.map((folder) => (
                <Card key={folder.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <FolderOpen className="h-20 w-20 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">{folder.name}</h3>
                      <p className="text-sm text-muted-foreground">{folder.files} files</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="ghost" className="w-full">
                      <Link href={`/folders/${folder.id}`}>Open</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {filteredFiles.map((file) => (
                <Card key={file.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <FileText className="h-20 w-20 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">{file.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {file.type} • {file.size}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="ghost" className="w-full">
                      <Link href={`/files/${file.id}`}>View</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              {mockFolders.map((folder, index) => (
                <div
                  key={folder.id}
                  className={`flex items-center justify-between p-4 ${
                    index !== mockFolders.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <FolderOpen className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{folder.name}</h3>
                      <p className="text-sm text-muted-foreground">{folder.files} files</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      <Clock className="mr-1 inline-block h-3 w-3" />
                      {new Date(folder.created).toLocaleDateString()}
                    </div>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/folders/${folder.id}`}>Open</Link>
                    </Button>
                  </div>
                </div>
              ))}
              {filteredFiles.map((file, index) => (
                <div
                  key={file.id}
                  className={`flex items-center justify-between p-4 ${
                    index !== filteredFiles.length - 1 || mockFolders.length > 0 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{file.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {file.type} • {file.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      <Clock className="mr-1 inline-block h-3 w-3" />
                      {new Date(file.modified).toLocaleDateString()}
                    </div>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/files/${file.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="folders" className="mt-6">
          {view === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {mockFolders.map((folder) => (
                <Card key={folder.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <FolderOpen className="h-20 w-20 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">{folder.name}</h3>
                      <p className="text-sm text-muted-foreground">{folder.files} files</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="ghost" className="w-full">
                      <Link href={`/folders/${folder.id}`}>Open</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              {mockFolders.map((folder, index) => (
                <div
                  key={folder.id}
                  className={`flex items-center justify-between p-4 ${
                    index !== mockFolders.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <FolderOpen className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{folder.name}</h3>
                      <p className="text-sm text-muted-foreground">{folder.files} files</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      <Clock className="mr-1 inline-block h-3 w-3" />
                      {new Date(folder.created).toLocaleDateString()}
                    </div>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/folders/${folder.id}`}>Open</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="recent" className="mt-6">
          {view === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredFiles
                .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
                .slice(0, 8)
                .map((file) => (
                  <Card key={file.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <FileText className="h-20 w-20 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {file.type} • {file.size}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="ghost" className="w-full">
                        <Link href={`/files/${file.id}`}>View</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="rounded-md border">
              {filteredFiles
                .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
                .slice(0, 8)
                .map((file, index, array) => (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between p-4 ${index !== array.length - 1 ? "border-b" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {file.type} • {file.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        <Clock className="mr-1 inline-block h-3 w-3" />
                        {new Date(file.modified).toLocaleDateString()}
                      </div>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/files/${file.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
