"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, BrainCircuit, Save, Tag } from "lucide-react"
import Link from "next/link"
import { Mem0Chat } from "@/components/mem0-chat"
import { createClientComponentClient } from "@/lib/db"

export default function Mem0IntegrationPage() {
  const [userId, setUserId] = useState<number | null>(null)
  const [aiMembers, setAiMembers] = useState<any[]>([])
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)
  const [memoryInput, setMemoryInput] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [isConfigured, setIsConfigured] = useState(false)
  const [apiKey, setApiKey] = useState("")

  useEffect(() => {
    // In a real app, this would come from authentication
    setUserId(1) // Using the admin user we created in the database

    // Fetch AI family members
    const fetchAiMembers = async () => {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase.from("fm_ai_members").select("*").eq("user_id", 1)

      if (data && !error) {
        setAiMembers(data)
        if (data.length > 0) {
          setSelectedMemberId(data[0].id)
        }
      }
    }

    // Fetch memory categories
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/mem0", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "getCategories",
            userId: 1,
          }),
        })

        const data = await response.json()
        if (data.categories) {
          setCategories(data.categories)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchAiMembers()
    fetchCategories()
  }, [])

  const handleSaveMemory = async () => {
    if (!memoryInput.trim() || !userId) return

    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          userId,
          aiMemberId: selectedMemberId,
          content: memoryInput,
          category: selectedCategory,
        }),
      })

      if (response.ok) {
        setMemoryInput("")
        setSelectedCategory(null)
        // Show success message or update UI
      }
    } catch (error) {
      console.error("Error saving memory:", error)
    }
  }

  const handleConfigureApi = () => {
    // In a real implementation, this would validate the API key
    localStorage.setItem("mem0ApiKey", apiKey)
    setIsConfigured(true)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <Link href="/">
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Mem0 Integration</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          {!isConfigured ? (
            <Card>
              <CardHeader>
                <CardTitle>Configure Mem0 API</CardTitle>
                <CardDescription>Enter your Mem0 API key to enable memory capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">Mem0 API Key</Label>
                    <Input
                      id="api-key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your Mem0 API key"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleConfigureApi} disabled={!apiKey}>
                  Configure
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <>
              {userId && <Mem0Chat userId={userId} aiMemberId={selectedMemberId || undefined} />}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Save className="mr-2 h-5 w-5" />
                    Save Memory
                  </CardTitle>
                  <CardDescription>Store important information for future reference</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ai-member">AI Family Member</Label>
                      <select
                        id="ai-member"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                        value={selectedMemberId || ""}
                        onChange={(e) => setSelectedMemberId(Number(e.target.value) || null)}
                      >
                        <option value="">None (General Memory)</option>
                        {aiMembers.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name} - {member.role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memory-category">Category</Label>
                      <select
                        id="memory-category"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                        value={selectedCategory || ""}
                        onChange={(e) => setSelectedCategory(e.target.value || null)}
                      >
                        <option value="">None</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Textarea
                      value={memoryInput}
                      onChange={(e) => setMemoryInput(e.target.value)}
                      placeholder="Enter memory to save..."
                    />
                    <div className="flex justify-between">
                      <Link href="/memory-categories">
                        <Button variant="outline">
                          <Tag className="mr-2 h-4 w-4" />
                          Manage Categories
                        </Button>
                      </Link>
                      <Button onClick={handleSaveMemory} disabled={!memoryInput.trim()}>
                        Save Memory
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BrainCircuit className="mr-2 h-5 w-5" />
              About Mem0 Integration
            </CardTitle>
            <CardDescription>How memory enhances your file manager experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Mem0 is an open-source memory layer for AI applications that enables personalized AI interactions. By
                integrating Mem0 with your file manager, your AI assistants can remember:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Your file organization preferences</li>
                <li>Frequently accessed documents and folders</li>
                <li>Previous interactions and conversations</li>
                <li>Custom instructions for handling specific file types</li>
              </ul>
              <p>
                This integration allows for a more personalized experience where your AI assistants learn and adapt to
                your specific needs over time.
              </p>
              <div className="mt-4 p-3 bg-muted rounded-md">
                <h3 className="font-medium mb-2">New Feature: Memory Categories</h3>
                <p className="text-sm">
                  You can now organize your memories into categories for better retrieval and context. Visit the{" "}
                  <Link href="/memory-categories" className="text-blue-500 hover:underline">
                    Memory Categories
                  </Link>{" "}
                  page to create and manage your categories.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-gray-500">
              Learn more about{" "}
              <a
                href="https://mem0.ai"
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mem0
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
