import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileCode, Terminal, Play, Server, Shield, Layers, Github, Cpu } from "lucide-react"
import { AuthStatus } from "@/components/auth-status"
import { TabsSection } from "@/components/tabs-section"

export function HomeContent() {
  return (
    <div className="min-h-screen bg-[hsl(222_47%_9%)]">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            WebContainer Manager
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Run, edit, and manage web containers directly in your browser with a powerful development environment
          </p>
          <AuthStatus />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-[hsl(222_47%_8%)]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Key Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="bg-[hsl(222_47%_11%)] border-gray-800 hover:border-gray-700 transition-colors">
              <CardHeader>
                <FileCode className="h-10 w-10 text-blue-500 mb-2" />
                <CardTitle>Code Editor</CardTitle>
                <CardDescription>Edit files with syntax highlighting and real-time preview</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Create, edit, and manage files with a powerful built-in code editor. Support for multiple file types
                  and syntax highlighting.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-[hsl(222_47%_11%)] border-gray-800 hover:border-gray-700 transition-colors">
              <CardHeader>
                <Terminal className="h-10 w-10 text-green-500 mb-2" />
                <CardTitle>Terminal Access</CardTitle>
                <CardDescription>Run commands directly in the browser</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Full terminal access to your container environment. Install packages, run scripts, and debug your
                  applications.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-[hsl(222_47%_11%)] border-gray-800 hover:border-gray-700 transition-colors">
              <CardHeader>
                <Play className="h-10 w-10 text-purple-500 mb-2" />
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>See your changes in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Preview your web applications instantly as you code. Built-in support for HTML, Markdown, and web
                  applications.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="bg-[hsl(222_47%_11%)] border-gray-800 hover:border-gray-700 transition-colors">
              <CardHeader>
                <Server className="h-10 w-10 text-yellow-500 mb-2" />
                <CardTitle>Container Management</CardTitle>
                <CardDescription>Manage your development environment</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Create, configure, and manage web containers with an intuitive interface. Full control over your
                  development environment.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="bg-[hsl(222_47%_11%)] border-gray-800 hover:border-gray-700 transition-colors">
              <CardHeader>
                <Layers className="h-10 w-10 text-red-500 mb-2" />
                <CardTitle>File System</CardTitle>
                <CardDescription>Organize and manage your files</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Intuitive file explorer with drag-and-drop support. Create, rename, move, and delete files and
                  directories with ease.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="bg-[hsl(222_47%_11%)] border-gray-800 hover:border-gray-700 transition-colors">
              <CardHeader>
                <Shield className="h-10 w-10 text-blue-500 mb-2" />
                <CardTitle>Secure Environment</CardTitle>
                <CardDescription>Isolated and secure containers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Run your code in a secure, isolated environment. No need to worry about system dependencies or
                  configuration.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <TabsSection />

      {/* Demo Section */}
      <section className="py-16 px-4 bg-[hsl(222_47%_8%)]">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold mb-6 text-center">See It In Action</h2>
          <p className="text-center text-gray-300 mb-10 max-w-3xl mx-auto">
            Experience the power of WebContainer Manager with our interactive demo
          </p>

          <div className="bg-[hsl(222_47%_11%)] border border-gray-800 rounded-lg p-4 h-80 flex items-center justify-center">
            <div className="text-center">
              <Cpu className="h-16 w-16 mx-auto mb-4 text-blue-500" />
              <h3 className="text-xl font-bold mb-2">Interactive Demo</h3>
              <p className="text-gray-400 mb-4">Click below to launch the interactive demo</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Link href="/demo" className="flex items-center">
                  Launch Demo
                  <Play className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">WebContainer Manager</h3>
              <p className="text-gray-400">
                A powerful web-based application for managing and running web containers directly in your browser.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/docs" className="text-gray-400 hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/templates" className="text-gray-400 hover:text-white">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="text-gray-400 hover:text-white">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-400 hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://github.com" className="text-gray-400 hover:text-white flex items-center">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </a>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-gray-400 hover:text-white">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} WebContainer Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
