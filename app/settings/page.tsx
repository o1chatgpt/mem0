"use client"

import { useState, Suspense } from "react"
import { ArrowLeft, User, Bell, Palette, Shield, Key, Globe } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Lazy load the settings components to reduce initial load time
const ProfileSettings = dynamic(
  () => import("@/components/settings/profile-settings").then((mod) => ({ default: mod.ProfileSettings })),
  {
    loading: () => <SettingsSkeleton />,
    ssr: false,
  },
)

const AccountSettings = dynamic(
  () => import("@/components/settings/account-settings").then((mod) => ({ default: mod.AccountSettings })),
  {
    loading: () => <SettingsSkeleton />,
    ssr: false,
  },
)

const AppearanceSettings = dynamic(
  () => import("@/components/settings/appearance-settings").then((mod) => ({ default: mod.AppearanceSettings })),
  {
    loading: () => <SettingsSkeleton />,
    ssr: false,
  },
)

const NotificationSettings = dynamic(
  () => import("@/components/settings/notification-settings").then((mod) => ({ default: mod.NotificationSettings })),
  {
    loading: () => <SettingsSkeleton />,
    ssr: false,
  },
)

const SecuritySettings = dynamic(
  () => import("@/components/settings/security-settings").then((mod) => ({ default: mod.SecuritySettings })),
  {
    loading: () => <SettingsSkeleton />,
    ssr: false,
  },
)

const IntegrationSettings = dynamic(
  () => import("@/components/settings/integration-settings").then((mod) => ({ default: mod.IntegrationSettings })),
  {
    loading: () => <SettingsSkeleton />,
    ssr: false,
  },
)

import dynamic from "next/dynamic"

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden md:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden md:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden md:inline">Integrations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your personal information and how it appears to others.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SettingsSkeleton />}>
                <ProfileSettings />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account credentials and preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SettingsSkeleton />}>
                <AccountSettings />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize how the application looks and feels.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SettingsSkeleton />}>
                <AppearanceSettings />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Control when and how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SettingsSkeleton />}>
                <NotificationSettings />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your security preferences and privacy.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SettingsSkeleton />}>
                <SecuritySettings />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Manage connections to external services and APIs.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SettingsSkeleton />}>
                <IntegrationSettings />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
