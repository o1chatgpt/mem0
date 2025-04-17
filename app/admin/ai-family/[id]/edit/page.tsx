"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, ArrowLeft, Save } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

type AIFamilyMember = {
  id: string
  name: string
  specialty: string
  description: string
  avatar_url?: string
  color?: string
  model?: string
  role?: string
  system_prompt?: string
}

export default function EditAIFamilyMemberPage({ params }: { params: { id: string } }) {
  const [member, setMember] = useState<AIFamilyMember>({
    id: "",
    name: "",
    specialty: "",
    description: "",
    role: "",
    color: "#4f46e5",
    model: "gpt-4o",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const isNewMember = params.id === "new"

  // Fetch AI family member if editing
  useEffect(() => {
    const fetchMember = async () => {
      if (isNewMember) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/admin/ai-family/${params.id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch AI family member")
        }

        setMember(data.member)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMember()
  }, [params.id, isNewMember])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setMember((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const url = isNewMember ? "/api/admin/ai-family" : `/api/admin/ai-family/${params.id}`

      const method = isNewMember ? "POST" : "PATCH"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(member),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save AI family member")
      }

      toast({
        title: isNewMember ? "Member Created" : "Member Updated",
        description: `${member.name} has been ${isNewMember ? "created" : "updated"} successfully.`,
      })

      // Redirect to AI family list
      router.push("/admin/ai-family")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
            <p className="mt-2">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/admin/ai-family">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{isNewMember ? "Add New AI Family Member" : `Edit ${member.name}`}</h1>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details for this AI family member</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id">ID (unique identifier)</Label>
                  <Input
                    id="id"
                    name="id"
                    value={member.id}
                    onChange={handleChange}
                    placeholder="e.g., stan, lyra, sophia"
                    required
                    disabled={!isNewMember}
                  />
                  {isNewMember && (
                    <p className="text-xs text-muted-foreground">Use a simple, lowercase identifier without spaces</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={member.name}
                    onChange={handleChange}
                    placeholder="e.g., Stan, Lyra, Sophia"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    name="role"
                    value={member.role || ""}
                    onChange={handleChange}
                    placeholder="e.g., Technical Lead, Home Assistant"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    name="specialty"
                    value={member.specialty}
                    onChange={handleChange}
                    placeholder="e.g., Programming, Home Management"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={member.description}
                  onChange={handleChange}
                  placeholder="Describe this AI family member's personality and capabilities"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Theme Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="color"
                      name="color"
                      value={member.color || "#4f46e5"}
                      onChange={handleChange}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={member.color || "#4f46e5"}
                      onChange={handleChange}
                      name="color"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    name="avatar_url"
                    value={member.avatar_url || ""}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.png"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>Configure the AI model and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Input
                  id="model"
                  name="model"
                  value={member.model || "gpt-4o"}
                  onChange={handleChange}
                  placeholder="e.g., gpt-4o, gpt-4-turbo"
                />
                <p className="text-xs text-muted-foreground">The OpenAI model to use for this AI family member</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="system_prompt">System Prompt</Label>
                <Textarea
                  id="system_prompt"
                  name="system_prompt"
                  value={member.system_prompt || ""}
                  onChange={handleChange}
                  placeholder="Enter the system prompt that defines this AI family member's behavior"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  The system prompt helps define the AI's personality and behavior
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" asChild>
                <Link href="/admin/ai-family">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isNewMember ? "Create Member" : "Save Changes"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AdminLayout>
  )
}
