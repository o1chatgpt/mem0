export function generatePreviewStats(stats: any) {
  if (!stats) return ""

  // Format category distribution for preview
  const topCategories = stats.categoryDistribution
    .slice(0, 3)
    .map((cat: any) => `<li>${cat.name}: ${cat.count} (${cat.percentage}%)</li>`)
    .join("")

  // Format monthly trend
  const recentMonths = stats.monthlyDistribution
    .slice(-3)
    .map((month: any) => `<li>${month.month}: ${month.count} memories</li>`)
    .join("")

  return `
    <p><strong>Top Categories:</strong></p>
    <ul>${topCategories}</ul>
    
    <p><strong>Recent Trends:</strong></p>
    <ul>${recentMonths}</ul>
    
    <p><em>Full details available in the attached file.</em></p>
  `
}
