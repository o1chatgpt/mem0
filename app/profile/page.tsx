"use client"

import type React from "react"

import { useState } from "react"
import { useSupabase } from "@/lib/supabase-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Header } from "@/components/header"
import { authService } from "@/lib/auth-service"

export default function ProfilePage() {
  const { user, userProfile, refreshProfile } = useSupabase()
  const [username, setUsername] = useState(userProfile?.username || "")
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatar_url || "")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("info")

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      if (!user) throw new Error("User not authenticated")

      const updatedProfile = await authService.updateUserProfile(user.id, {
        username,
        avatar_url: avatarUrl,
      })

      if (!updatedProfile) throw new Error("Failed to update profile")

      await refreshProfile()
      setSuccessMessage("Profile updated successfully")
    } catch (error) {
      setError((error as Error).message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (!user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading profile...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 p-4 bg-gray-100">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userProfile.avatar_url || undefined} alt={userProfile.username} />
                  <AvatarFallback className="text-2xl">{getInitials(userProfile.username)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{userProfile.username}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                  <CardDescription className="capitalize">{userProfile.role}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert className="mb-4">
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar-url">Avatar URL</Label>
                  <Input
                    id="avatar-url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                Account created on {new Date(userProfile.created_at).toLocaleDateString()}
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
