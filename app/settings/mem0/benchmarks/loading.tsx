import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { BarChart } from "lucide-react"

export default function MemoryBenchmarkLoading() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Skeleton className="h-10 w-10 mr-2" />
        <Skeleton className="h-8 w-64" />
      </div>

      <div className="mb-4">
        <Skeleton className="h-10 w-full mb-4" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-muted" />
            <Skeleton className="h-6 w-64" />
          </div>
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
