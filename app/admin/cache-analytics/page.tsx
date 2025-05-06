import { CacheAnalyticsDashboard } from "@/components/cache-analytics-dashboard"

export default function CacheAnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Cache Analytics</h1>
      <CacheAnalyticsDashboard />
    </div>
  )
}
