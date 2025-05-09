import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="container mx-auto py-6 flex flex-col items-center justify-center min-h-[80vh]">
      <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        The memory analytics page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button>Return to Dashboard</Button>
      </Link>
    </div>
  )
}
