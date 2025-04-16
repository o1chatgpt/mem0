"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileIcon, ServerIcon, GlobeIcon, UserIcon, LogOutIcon, SettingsIcon, HomeIcon } from "lucide-react"

interface HeaderProps {
  activeTab: string
  onTabChange: (value: string) => void
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const router = useRouter()
  const { user, userProfile, signOut } = useSupabase()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="bg-white border-b border-gray-200 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold flex items-center">
            <HomeIcon className="mr-2 h-6 w-6" />
            File Manager
          </Link>

          <Tabs value={activeTab} onValueChange={onTabChange} className="hidden md:block">
            <TabsList>
              <TabsTrigger value="files" className="flex items-center">
                <FileIcon className="mr-2 h-4 w-4" />
                Files
              </TabsTrigger>
              <TabsTrigger value="server" className="flex items-center">
                <ServerIcon className="mr-2 h-4 w-4" />
                Server
              </TabsTrigger>
              <TabsTrigger value="websites" className="flex items-center">
                <GlobeIcon className="mr-2 h-4 w-4" />
                Websites
              </TabsTrigger>
              <TabsTrigger value="ai-family" className="flex items-center">
                <UserIcon className="mr-2 h-4 w-4" />
                AI Family
              </TabsTrigger>
              <TabsTrigger value="info" className="flex items-center">
                <SettingsIcon className="mr-2 h-4 w-4" />
                System Info
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage
                    src={userProfile?.avatar_url || "/placeholder.svg"}
                    alt={userProfile?.username || user.email || ""}
                  />
                  <AvatarFallback>
                    {userProfile?.username
                      ? getInitials(userProfile.username)
                      : user.email
                        ? user.email.substring(0, 2).toUpperCase()
                        : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{userProfile?.username || "User"}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                  <span className="text-xs text-gray-500 capitalize">{userProfile?.role || "User"}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                disabled={isLoggingOut}
                onClick={handleSignOut}
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
