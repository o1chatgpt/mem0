export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white">Loading your dashboard...</h2>
        <p className="text-gray-400 mt-2">This may take a moment</p>
      </div>
    </div>
  )
}
