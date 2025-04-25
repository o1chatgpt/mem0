"use client"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MemoryCategoryManager } from "@/components/memory-category-manager"

export default function MemoryCategoriesPage() {
  // In a real app, this would come from authentication
  const userId = 1 // Using the admin user we created in the database

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/mem0-integration">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mem0 Integration
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Memory Categories</h1>
        </div>
      </div>

      <div className="grid gap-6">
        <MemoryCategoryManager userId={userId} />
      </div>
    </div>
  )
}
