import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Activity } from "lucide-react"

export default function MemoryPerformanceLoading() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Skeleton className="h-10 w-10 mr-2" />
        <Skeleton className="h-8 w-64" />
      </div>

      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-10 w-[180px]" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      <div className="mb-4">
        <Skeleton className="h-10 w-full mb-4" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-muted" />
            <Skeleton className="h-6 w-64" />
          </div>
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
