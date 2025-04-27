"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { Plus, FolderPlus, Download, Clock, Star, FileCode } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export function DashboardContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("recent")

  // Sample project data
  const recentProjects = [
    { id: 1, name: "React App", description: "A simple React application", lastEdited: "2 hours ago" },
    { id: 2, name: "Node API", description: "RESTful API with Express", lastEdited: "Yesterday" },
    { id: 3, name: "Portfolio Site", description: "Personal portfolio website", lastEdited: "3 days ago" },
  ]

  const starredProjects = [
    { id: 2, name: "Node API", description: "RESTful API with Express", lastEdited: "Yesterday" },
    { id: 4, name: "Blog Template", description: "Markdown blog template", lastEdited: "Last week" },
  ]

  // Sample templates
  const templates = [
    { id: 1, name: "React Starter", description: "Basic React application with TypeScript" },
    { id: 2, name: "Next.js App", description: "Next.js application with API routes" },
    { id: 3, name: "Express API", description: "RESTful API with Express and MongoDB" },
    { id: 4, name: "Static Site", description: "HTML, CSS, and JavaScript static site" },
  ]

  return (
    <div className="min-h-screen bg-[hsl(222_47%_9%)]">
      <Header />

      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user?.name || "User"}</p>
          </div>

          <div className="flex space-x-4 mt-4 md:mt-0">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
            <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
              <FolderPlus className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-[hsl(222_47%_13%)]">
                <TabsTrigger value="recent" className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Recent Projects
                </TabsTrigger>
                <TabsTrigger value="starred" className="flex items-center">
                  <Star className="mr-2 h-4 w-4" />
                  Starred
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recent">
                {recentProjects.length > 0 ? (
                  <div className="space-y-4">
                    {recentProjects.map((project) => (
                      <Card
                        key={project.id}
                        className="bg-[hsl(222_47%_11%)] border-gray-800 hover:border-gray-700 transition-colors"
                      >
                        <CardHeader className="pb-2">
                          <CardTitle>{project.name}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-2 flex justify-between">
                          <span className="text-xs text-gray-400">Last edited: {project.lastEdited}</span>
                          <Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-800">
                            <Link href={`/editor/${project.id}`}>Open</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-[hsl(222_47%_11%)] border-gray-800">
                    <CardContent className="pt-6 text-center">
                      <p className="text-gray-400 mb-4">You don't have any recent projects</p>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Project
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="starred">
                {starredProjects.length > 0 ? (
                  <div className="space-y-4">
                    {starredProjects.map((project) => (
                      <Card
                        key={project.id}
                        className="bg-[hsl(222_47%_11%)] border-gray-800 hover:border-gray-700 transition-colors"
                      >
                        <CardHeader className="pb-2">
                          <CardTitle>{project.name}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-2 flex justify-between">
                          <span className="text-xs text-gray-400">Last edited: {project.lastEdited}</span>
                          <Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-800">
                            <Link href={`/editor/${project.id}`}>Open</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-[hsl(222_47%_11%)] border-gray-800">
                    <CardContent className="pt-6 text-center">
                      <p className="text-gray-400 mb-4">You don't have any starred projects</p>
                      <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
                        <Star className="mr-2 h-4 w-4" />
                        Star a Project
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Templates</h2>
            <div className="space-y-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="bg-[hsl(222_47%_11%)] border-gray-800 hover:border-gray-700 transition-colors"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs">{template.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <Button variant="outline" size="sm" className="w-full border-gray-700 hover:bg-gray-800">
                      <FileCode className="mr-2 h-4 w-4" />
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              <Card className="bg-[hsl(222_47%_11%)] border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">More Templates</CardTitle>
                  <CardDescription className="text-xs">Browse all available templates</CardDescription>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Button variant="outline" size="sm" className="w-full border-gray-700 hover:bg-gray-800">
                    <Link href="/templates" className="flex items-center w-full justify-center">
                      <Download className="mr-2 h-4 w-4" />
                      Browse All
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
