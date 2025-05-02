"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export default function OpenAISettingsPage() {
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function initializeSettings() {
      setIsInitializing(true)
      setError(null)

      try {
        // First, ensure the user_settings table exists
        const setupResponse = await fetch("/api/setup-user-settings", {
          method: "POST",
        })

        if (!setupResponse.ok) {
          const errorData = await setupResponse.json()
          console.error("Setup failed:", errorData)
          setError("Failed to initialize settings database. Please try again later.")
          setIsInitializing(false)
          return
        }

        // Now try to load the API key
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
          setError("You must be logged in to access settings")
          setIsInitializing(false)
          return
        }

        // Check if the user has settings
        const { data, error } = await supabase
          .from("user_settings")
          .select("openai_api_key")
          .eq("user_id", userData.user.id)
          .maybeSingle()

        if (error && error.code !== "PGRST116") {
          // PGRST116 means no rows returned, which is fine for new users
          console.error("Error loading API key:", error)
          setError(`Error loading settings: ${error.message}`)
          setIsInitializing(false)
          return
        }

        if (data && data.openai_api_key) {
          // Show masked version of the API key
          setApiKey("sk-************************")
        }

        setIsInitializing(false)
      } catch (error: any) {
        console.error("Error in initializeSettings:", error)
        setError(`An unexpected error occurred: ${error.message}`)
        setIsInitializing(false)
      }
    }

    initializeSettings()
  }, [supabase])

  async function handleSaveApiKey() {
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      // Only save if it's a new key (not the masked version)
      if (apiKey && !apiKey.includes("*")) {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
          throw new Error("You must be logged in to save settings")
        }

        // First check if the user already has settings
        const { data: existingSettings } = await supabase
          .from("user_settings")
          .select("id")
          .eq("user_id", userData.user.id)
          .maybeSingle()

        let result

        if (existingSettings) {
          // Update existing settings
          result = await supabase
            .from("user_settings")
            .update({
              openai_api_key: apiKey,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userData.user.id)
        } else {
          // Insert new settings
          result = await supabase.from("user_settings").insert({
            user_id: userData.user.id,
            openai_api_key: apiKey,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }

        if (result.error) {
          throw result.error
        }

        toast({
          title: "API Key Saved",
          description: "Your OpenAI API key has been saved successfully.",
        })

        // Show masked version after saving
        setApiKey("sk-************************")
      } else {
        toast({
          title: "No Changes",
          description: "No changes were made to your API key.",
        })
      }
    } catch (error: any) {
      console.error("Error saving API key:", error)
      setError(`Failed to save API key: ${error.message}`)
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleTestApiKey() {
    if (isTesting) return

    setIsTesting(true)
    setError(null)

    try {
      const response = await fetch("/api/test-openai-key", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "API Key Valid",
          description: "Your OpenAI API key is valid and working correctly.",
        })
      } else {
        setError(`API Key Error: ${data.error || "Your OpenAI API key is invalid or has expired."}`)
        toast({
          title: "API Key Invalid",
          description: data.error || "Your OpenAI API key is invalid or has expired.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error testing API key:", error)
      setError(`Failed to test API key: ${error.message}`)
      toast({
        title: "Error",
        description: "Failed to test API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  if (isInitializing) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">OpenAI Settings</h1>
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Loading settings...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">OpenAI Settings</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>OpenAI API Key</CardTitle>
          <CardDescription>Configure your OpenAI API key for AI features like chat and embeddings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Your API key is stored securely and never shared.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleTestApiKey} disabled={isTesting || isLoading}>
            {isTesting ? "Testing..." : "Test API Key"}
          </Button>
          <Button onClick={handleSaveApiKey} disabled={isLoading || isTesting}>
            {isLoading ? "Saving..." : "Save API Key"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
