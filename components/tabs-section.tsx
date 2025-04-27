"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function TabsSection() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-[hsl(222_47%_13%)]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="technical">Technical Details</TabsTrigger>
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-6 bg-[hsl(222_47%_11%)] rounded-md border border-gray-800">
            <h3 className="text-2xl font-bold mb-4">WebContainer Manager</h3>
            <p className="mb-4 text-gray-300">
              WebContainer Manager is a powerful web-based application that allows you to run, edit, and manage web
              containers directly in your browser. It provides a complete development environment with file management,
              code editing, terminal access, and preview capabilities.
            </p>
            <p className="mb-4 text-gray-300">
              Whether you're a developer looking for a quick way to test code, a teacher creating coding examples, or a
              team collaborating on a project, WebContainer Manager provides the tools you need to be productive.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm">JavaScript</span>
              <span className="px-3 py-1 bg-green-900/30 text-green-300 rounded-full text-sm">Node.js</span>
              <span className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm">React</span>
              <span className="px-3 py-1 bg-yellow-900/30 text-yellow-300 rounded-full text-sm">HTML/CSS</span>
              <span className="px-3 py-1 bg-red-900/30 text-red-300 rounded-full text-sm">Web Development</span>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="p-6 bg-[hsl(222_47%_11%)] rounded-md border border-gray-800">
            <h3 className="text-2xl font-bold mb-4">Technical Details</h3>
            <p className="mb-4 text-gray-300">
              WebContainer Manager is built on modern web technologies to provide a seamless development experience:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-300">
              <li>
                <strong>WebContainer API:</strong> Run Node.js directly in the browser
              </li>
              <li>
                <strong>Next.js:</strong> React framework for the user interface
              </li>
              <li>
                <strong>TypeScript:</strong> Type-safe JavaScript for reliability
              </li>
              <li>
                <strong>Tailwind CSS:</strong> Utility-first CSS framework for styling
              </li>
              <li>
                <strong>shadcn/ui:</strong> High-quality UI components
              </li>
            </ul>
            <p className="text-gray-300">
              The application requires cross-origin isolation to enable full functionality. This is automatically
              configured when deployed to Vercel or when running with the provided server configuration.
            </p>
          </TabsContent>

          <TabsContent value="getting-started" className="p-6 bg-[hsl(222_47%_11%)] rounded-md border border-gray-800">
            <h3 className="text-2xl font-bold mb-4">Getting Started</h3>
            <ol className="list-decimal pl-6 mb-6 space-y-4 text-gray-300">
              <li>
                <strong>Create an account or log in</strong>
                <p className="mt-1 text-gray-400">
                  Use the registration page to create a new account or log in with your existing credentials.
                </p>
              </li>
              <li>
                <strong>Create a new project</strong>
                <p className="mt-1 text-gray-400">
                  Start with a blank project or use one of our templates to get started quickly.
                </p>
              </li>
              <li>
                <strong>Edit your files</strong>
                <p className="mt-1 text-gray-400">Use the built-in code editor to create and edit your files.</p>
              </li>
              <li>
                <strong>Run your code</strong>
                <p className="mt-1 text-gray-400">
                  Use the terminal to run commands or click the "Run" button to execute your code.
                </p>
              </li>
              <li>
                <strong>Preview your application</strong>
                <p className="mt-1 text-gray-400">Use the preview panel to see your application in action.</p>
              </li>
            </ol>
            <div className="mt-6">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Link href="/login" className="flex items-center">
                  Start Coding Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
