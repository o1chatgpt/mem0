"use client"

import { SimplifiedImageGenerator } from "@/components/simplified-image-generator"
import { MainNav } from "@/components/main-nav"

export default function ImagePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <MainNav />
      </div>
      <h1 className="text-3xl font-bold mb-6">Image Generation</h1>
      <SimplifiedImageGenerator />
    </div>
  )
}
