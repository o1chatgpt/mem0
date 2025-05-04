import type React from "react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Mem0Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Memory Management</h1>
      </div>

      <Tabs defaultValue="memories" className="w-full">
        <TabsList>
          <TabsTrigger value="memories" asChild>
            <Link href="/mem0">Memories</Link>
          </TabsTrigger>
          <TabsTrigger value="visualize" asChild>
            <Link href="/mem0/visualize">Visualize</Link>
          </TabsTrigger>
          <TabsTrigger value="settings" asChild>
            <Link href="/mem0/settings">Settings</Link>
          </TabsTrigger>
          <TabsTrigger value="diagnostics" asChild>
            <Link href="/mem0/settings/diagnostics">Diagnostics</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {children}
    </div>
  )
}
