"use client"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { BlogScraperWorkflow } from "@/components/crewai/blog-scraper-workflow"
import { useRouter } from "next/navigation"

export default function BlogScraperPage() {
  const router = useRouter()
  // In a real app, this would come from authentication
  const userId = 1

  const handleWorkflowSaved = () => {
    // Navigate to workflows page after saving
    router.push("/crewai")
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/crewai">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to CrewAI
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Web Scraping to Blog Post Workflow</h1>
        </div>
      </div>

      <BlogScraperWorkflow userId={userId} onSave={handleWorkflowSaved} />
    </div>
  )
}
