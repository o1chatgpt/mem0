import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Type definitions for analytics data
export type CategoryStat = {
  name: string
  count: number
  percentage: number
  color: string
  description?: string | null
}

export type MonthlyData = {
  month: string
  count: number
}

export type AnalyticsData = {
  totalMemories: number
  categoriesUsed: number
  memorySpan: string
  categoryDistribution: CategoryStat[]
  monthlyDistribution: MonthlyData[]
  uncategorizedCount: number
  oldestDate: string | null
  newestDate: string | null
}

// Function to export analytics data as CSV
export function exportAsCSV(data: AnalyticsData, fileName = "memory-analytics") {
  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8,"

  // Add summary section
  csvContent += "MEMORY ANALYTICS SUMMARY\n"
  csvContent += `Total Memories,${data.totalMemories}\n`
  csvContent += `Categories Used,${data.categoriesUsed}\n`
  csvContent += `Memory Span,${data.memorySpan}\n`
  csvContent += `Uncategorized Memories,${data.uncategorizedCount}\n`
  csvContent += `Oldest Memory,${data.oldestDate || "N/A"}\n`
  csvContent += `Newest Memory,${data.newestDate || "N/A"}\n\n`

  // Add category distribution
  csvContent += "CATEGORY DISTRIBUTION\n"
  csvContent += "Category,Count,Percentage\n"
  data.categoryDistribution.forEach((category) => {
    csvContent += `${category.name},${category.count},${category.percentage}%\n`
  })
  csvContent += "\n"

  // Add monthly distribution
  csvContent += "MONTHLY DISTRIBUTION\n"
  csvContent += "Month,Count\n"
  data.monthlyDistribution.forEach((month) => {
    csvContent += `${month.month},${month.count}\n`
  })

  // Create download link
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `${fileName}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Function to export analytics data as PDF
export function exportAsPDF(data: AnalyticsData, fileName = "memory-analytics") {
  // Create new PDF document
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Add title
  doc.setFontSize(18)
  doc.text("Memory Analytics Report", pageWidth / 2, 15, { align: "center" })
  doc.setFontSize(12)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 22, { align: "center" })
  doc.setLineWidth(0.5)
  doc.line(15, 25, pageWidth - 15, 25)

  // Add summary section
  doc.setFontSize(14)
  doc.text("Summary", 15, 35)
  doc.setFontSize(10)

  const summaryData = [
    ["Total Memories", data.totalMemories.toString()],
    ["Categories Used", data.categoriesUsed.toString()],
    ["Memory Span", data.memorySpan],
    ["Uncategorized Memories", data.uncategorizedCount.toString()],
    ["Oldest Memory", data.oldestDate || "N/A"],
    ["Newest Memory", data.newestDate || "N/A"],
  ]

  autoTable(doc, {
    startY: 40,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    margin: { left: 15, right: 15 },
  })

  // Add category distribution
  doc.setFontSize(14)
  doc.text("Category Distribution", 15, doc.lastAutoTable.finalY + 15)

  const categoryData = data.categoryDistribution.map((category) => [
    category.name,
    category.count.toString(),
    `${category.percentage}%`,
  ])

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    head: [["Category", "Count", "Percentage"]],
    body: categoryData,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    margin: { left: 15, right: 15 },
  })

  // Add monthly distribution
  doc.setFontSize(14)
  doc.text("Monthly Distribution", 15, doc.lastAutoTable.finalY + 15)

  const monthlyData = data.monthlyDistribution.map((month) => [month.month, month.count.toString()])

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    head: [["Month", "Count"]],
    body: monthlyData,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    margin: { left: 15, right: 15 },
  })

  // Add insights section
  doc.setFontSize(14)
  doc.text("Insights", 15, doc.lastAutoTable.finalY + 15)
  doc.setFontSize(10)

  let insightsText = ""

  if (data.uncategorizedCount > 0) {
    const uncategorizedPercentage = Math.round((data.uncategorizedCount / data.totalMemories) * 100)
    insightsText += `• ${data.uncategorizedCount} memories (${uncategorizedPercentage}%) are uncategorized.\n`
  } else {
    insightsText += "• All memories have been categorized. Great organization!\n"
  }

  if (data.categoryDistribution.length > 0) {
    insightsText += `• Most used category: ${data.categoryDistribution[0].name} with ${
      data.categoryDistribution[0].count
    } memories (${data.categoryDistribution[0].percentage}%)\n`
  }

  if (data.monthlyDistribution.length > 1) {
    const lastMonth = data.monthlyDistribution[data.monthlyDistribution.length - 1]
    const previousMonth = data.monthlyDistribution[data.monthlyDistribution.length - 2]
    insightsText += `• Memory creation has ${
      lastMonth.count > previousMonth.count ? "increased" : "decreased"
    } in the most recent month.\n`
  }

  doc.text(insightsText, 15, doc.lastAutoTable.finalY + 20, {
    maxWidth: pageWidth - 30,
    lineHeightFactor: 1.5,
  })

  // Add footer
  const pageCount = doc.internal.getNumberOfPages()
  doc.setFontSize(8)
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(
      `Page ${i} of ${pageCount} | Generated by File Manager with Mem0 Integration`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" },
    )
  }

  // Save the PDF
  doc.save(`${fileName}.pdf`)
}

// Function to prepare analytics data for export
export function prepareAnalyticsDataForExport(stats: any): AnalyticsData {
  return {
    totalMemories: stats.count || 0,
    categoriesUsed: stats.categoryDistribution?.length || 0,
    memorySpan: formatTimeSpan(stats.timeSpan || 0),
    categoryDistribution: stats.categoryDistribution || [],
    monthlyDistribution: prepareMonthlyData(stats.monthlyDistribution || {}),
    uncategorizedCount: stats.uncategorizedCount || 0,
    oldestDate: stats.oldestDate ? new Date(stats.oldestDate).toLocaleDateString() : null,
    newestDate: stats.newestDate ? new Date(stats.newestDate).toLocaleDateString() : null,
  }
}

// Helper function to format time span
function formatTimeSpan(timeSpan: number): string {
  const days = Math.floor(timeSpan / (1000 * 60 * 60 * 24))
  if (days > 30) {
    const months = Math.floor(days / 30)
    return `${months} month${months !== 1 ? "s" : ""}`
  }
  return `${days} day${days !== 1 ? "s" : ""}`
}

// Helper function to prepare monthly data
function prepareMonthlyData(monthlyDistribution: Record<string, number>): MonthlyData[] {
  return Object.entries(monthlyDistribution)
    .map(([month, count]) => {
      const [year, monthNum] = month.split("-")
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const displayMonth = `${monthNames[Number.parseInt(monthNum) - 1]} ${year}`
      return {
        month: displayMonth,
        count: count as number,
      }
    })
    .sort((a, b) => {
      // Sort by date (assuming format is "MMM YYYY")
      const [aMonth, aYear] = a.month.split(" ")
      const [bMonth, bYear] = b.month.split(" ")

      if (aYear !== bYear) return Number.parseInt(aYear) - Number.parseInt(bYear)

      const monthOrder = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      }
      return monthOrder[aMonth as keyof typeof monthOrder] - monthOrder[bMonth as keyof typeof monthOrder]
    })
}
