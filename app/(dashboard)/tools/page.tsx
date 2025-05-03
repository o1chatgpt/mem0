"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Globe, Database, Code, FileText, Cpu } from "lucide-react"
import Link from "next/link"

export default function ToolsPage() {
  const tools = [
    {
      name: "Web Search",
      description: "Search the web for information",
      icon: Globe,
      status: "Active",
      href: "#",
    },
    {
      name: "Database Query",
      description: "Query your database using natural language",
      icon: Database,
      status: "Active",
      href: "#",
    },
    {
      name: "Code Assistant",
      description: "Get help with coding and debugging",
      icon: Code,
      status: "Active",
      href: "#",
    },
    {
      name: "Document Analysis",
      description: "Extract information from documents",
      icon: FileText,
      status: "Active",
      href: "#",
    },
    {
      name: "AI Model Integration",
      description: "Connect to external AI models",
      icon: Cpu,
      status: "Coming Soon",
      href: "#",
    },
    {
      name: "Custom Search",
      description: "Create custom search engines",
      icon: Search,
      status: "Coming Soon",
      href: "#",
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">AI Tools</h1>
        <p className="text-lg text-muted-foreground">
          Enhance your AI family members with powerful tools and integrations
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.name}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <tool.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{tool.name}</CardTitle>
                  <CardDescription>{tool.status}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p>{tool.description}</p>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                className="w-full"
                variant={tool.status === "Coming Soon" ? "outline" : "default"}
                disabled={tool.status === "Coming Soon"}
              >
                <Link href={tool.href}>{tool.status === "Coming Soon" ? "Coming Soon" : "Configure Tool"}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
