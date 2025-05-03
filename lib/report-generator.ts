import type { BenchmarkResult } from "./benchmark-service"
import type { jsPDF } from "jspdf"
import "jspdf-autotable"
import { memoryStore } from "./memory-store"

// Add the autotable plugin type to jsPDF
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export interface ReportOptions {
  title?: string
  includeEnvironmentInfo?: boolean
  includeOperationDetails?: boolean
  includeCharts?: boolean
  includeComparison?: boolean
  comparisonResults?: BenchmarkResult[]
  notes?: string
  colorTheme?: "default" | "blue" | "green" | "grayscale"
}

export interface ReportGenerationResult {
  success: boolean
  message?: string
  dataUrl?: string
  filename?: string
}

class ReportGenerator {
  // Generate a PDF report for a benchmark result
  async generateReport(benchmarkResult: BenchmarkResult, options: ReportOptions = {}): Promise<ReportGenerationResult> {
    try {
      // Set default options
      const defaultOptions: ReportOptions = {
        title: `Benchmark Report: ${benchmarkResult.name}`,
        includeEnvironmentInfo: true,
        includeOperationDetails: true,
        includeCharts: true,
        includeComparison: false,
        comparisonResults: [],
        notes: "",
        colorTheme: "default",
      }

      // Merge with provided options
      const reportOptions = { ...defaultOptions, ...options }

      // In a real implementation, we would generate a PDF here
      // For now, we'll just create a simple HTML report and convert it to a data URL
      const htmlContent = this.generateHtmlReport(benchmarkResult, reportOptions)

      // Convert HTML to data URL (this is a simplified approach)
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`

      // Generate a filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const filename = `benchmark-report-${benchmarkResult.name.replace(/\s+/g, "-").toLowerCase()}-${timestamp}.html`

      return {
        success: true,
        dataUrl,
        filename,
      }
    } catch (error) {
      console.error("Error generating report:", error)
      return {
        success: false,
        message: `Error generating report: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  // Generate an HTML report
  private generateHtmlReport(benchmarkResult: BenchmarkResult, options: ReportOptions): string {
    const {
      title,
      includeEnvironmentInfo,
      includeOperationDetails,
      includeCharts,
      includeComparison,
      comparisonResults,
      notes,
      colorTheme,
    } = options

    // Get theme colors
    const theme = this.getThemeColors(colorTheme || "default")

    // Start building HTML
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            color: ${theme.text};
            background-color: ${theme.background};
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          h1, h2, h3 {
            color: ${theme.primary};
          }
          .header {
            border-bottom: 2px solid ${theme.primary};
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .date {
            color: ${theme.lightText};
            font-size: 0.9em;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            background-color: ${theme.primary};
            color: white;
            text-align: left;
            padding: 8px;
          }
          td {
            padding: 8px;
            border-bottom: 1px solid ${theme.border};
          }
          tr:nth-child(even) {
            background-color: ${theme.lightBackground};
          }
          .section {
            margin: 30px 0;
          }
          .chart-container {
            margin: 20px 0;
          }
          .bar {
            height: 20px;
            background-color: ${theme.primary};
            margin: 5px 0;
          }
          .notes {
            background-color: ${theme.lightBackground};
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 10px;
            border-top: 1px solid ${theme.border};
            color: ${theme.lightText};
            font-size: 0.8em;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
            <div class="date">Generated on ${new Date().toLocaleString()}</div>
          </div>
    `

    // Add benchmark summary
    html += `
      <div class="section">
        <h2>Benchmark Summary</h2>
        <table>
          <tr>
            <td><strong>Benchmark Name</strong></td>
            <td>${benchmarkResult.name}</td>
          </tr>
          <tr>
            <td><strong>Description</strong></td>
            <td>${benchmarkResult.description || "N/A"}</td>
          </tr>
          <tr>
            <td><strong>Date</strong></td>
            <td>${new Date(benchmarkResult.timestamp).toLocaleString()}</td>
          </tr>
          <tr>
            <td><strong>Total Duration</strong></td>
            <td>${this.formatDuration(benchmarkResult.duration)}</td>
          </tr>
          <tr>
            <td><strong>Operations</strong></td>
            <td>${benchmarkResult.operations.length} operations</td>
          </tr>
          <tr>
            <td><strong>Storage Mode</strong></td>
            <td>${benchmarkResult.environment.storageMode}</td>
          </tr>
        </table>
      </div>
    `

    // Add environment information if requested
    if (includeEnvironmentInfo) {
      html += `
        <div class="section">
          <h2>Environment Information</h2>
          <table>
            <tr>
              <td><strong>Browser</strong></td>
              <td>${benchmarkResult.environment.browser}</td>
            </tr>
            <tr>
              <td><strong>Platform</strong></td>
              <td>${benchmarkResult.environment.platform}</td>
            </tr>
            <tr>
              <td><strong>Connection Speed</strong></td>
              <td>${benchmarkResult.environment.connectionSpeed || "Unknown"}</td>
            </tr>
            <tr>
              <td><strong>Memory Usage</strong></td>
              <td>${
                benchmarkResult.environment.memoryUsage
                  ? `${Math.round(benchmarkResult.environment.memoryUsage / (1024 * 1024))} MB`
                  : "Unknown"
              }</td>
            </tr>
          </table>
        </div>
      `
    }

    // Add operation details if requested
    if (includeOperationDetails) {
      html += `
        <div class="section">
          <h2>Operation Details</h2>
          <table>
            <tr>
              <th>Operation</th>
              <th>Type</th>
              <th>Iterations</th>
              <th>Avg Duration</th>
              <th>Success Rate</th>
              <th>Errors</th>
            </tr>
      `

      benchmarkResult.operations.forEach((op) => {
        html += `
          <tr>
            <td>${op.name}</td>
            <td>${op.operationType}</td>
            <td>${op.iterations}</td>
            <td>${this.formatDuration(op.averageDuration)}</td>
            <td>${op.successRate.toFixed(1)}%</td>
            <td>${op.errorCount}</td>
          </tr>
        `
      })

      html += `
          </table>
        </div>
      `
    }

    // Add charts if requested
    if (includeCharts) {
      html += `
        <div class="section">
          <h2>Performance Charts</h2>
          <div class="chart-container">
            <h3>Average Duration by Operation</h3>
      `

      // Sort operations by average duration (descending)
      const sortedOperations = [...benchmarkResult.operations].sort((a, b) => b.averageDuration - a.averageDuration)

      // Find the maximum duration for scaling
      const maxDuration = Math.max(...sortedOperations.map((op) => op.averageDuration))

      sortedOperations.forEach((op) => {
        const barWidth = (op.averageDuration / maxDuration) * 100

        html += `
          <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>${op.name}</span>
              <span>${this.formatDuration(op.averageDuration)}</span>
            </div>
            <div class="bar" style="width: ${barWidth}%;"></div>
          </div>
        `
      })

      html += `
          </div>
        </div>
      `
    }

    // Add comparison if requested
    if (includeComparison && comparisonResults && comparisonResults.length > 0) {
      html += `
        <div class="section">
          <h2>Benchmark Comparison</h2>
          <table>
            <tr>
              <th>Benchmark</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Operations</th>
              <th>Browser</th>
              <th>Platform</th>
            </tr>
      `

      // Add main result
      html += `
        <tr>
          <td>${benchmarkResult.name}</td>
          <td>${new Date(benchmarkResult.timestamp).toLocaleString()}</td>
          <td>${this.formatDuration(benchmarkResult.duration)}</td>
          <td>${benchmarkResult.operations.length}</td>
          <td>${benchmarkResult.environment.browser}</td>
          <td>${benchmarkResult.environment.platform}</td>
        </tr>
      `

      // Add comparison results
      comparisonResults.forEach((result) => {
        html += `
          <tr>
            <td>${result.name}</td>
            <td>${new Date(result.timestamp).toLocaleString()}</td>
            <td>${this.formatDuration(result.duration)}</td>
            <td>${result.operations.length}</td>
            <td>${result.environment.browser}</td>
            <td>${result.environment.platform}</td>
          </tr>
        `
      })

      html += `
          </table>
        </div>
      `

      // Get all unique operation names across all benchmarks
      const allOperations = new Set<string>()
      ;[benchmarkResult, ...comparisonResults].forEach((result) => {
        result.operations.forEach((op) => {
          allOperations.add(op.name)
        })
      })

      // Add comparison table for average durations
      html += `
        <div class="section">
          <h3>Average Duration Comparison</h3>
          <table>
            <tr>
              <th>Operation</th>
              <th>${benchmarkResult.name}</th>
      `

      comparisonResults.forEach((result) => {
        html += `<th>${result.name}</th>`
      })

      html += `</tr>`

      allOperations.forEach((opName) => {
        html += `<tr><td>${opName}</td>`

        // Add data for main result
        const mainOp = benchmarkResult.operations.find((op) => op.name === opName)
        html += `<td>${mainOp ? this.formatDuration(mainOp.averageDuration) : "N/A"}</td>`

        // Add data for comparison results
        comparisonResults.forEach((result) => {
          const op = result.operations.find((op) => op.name === opName)
          html += `<td>${op ? this.formatDuration(op.averageDuration) : "N/A"}</td>`
        })

        html += `</tr>`
      })

      html += `
          </table>
        </div>
      `
    }

    // Add notes if provided
    if (notes) {
      html += `
        <div class="section">
          <h2>Notes</h2>
          <div class="notes">
            ${notes.replace(/\n/g, "<br>")}
          </div>
        </div>
      `
    }

    // Add footer
    html += `
          <div class="footer">
            <p>Generated with Mem0 Benchmark Report Generator</p>
            <p>${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `

    return html
  }

  // Get theme colors based on the selected theme
  private getThemeColors(theme: string): any {
    const themes = {
      default: {
        primary: "#2962ff",
        secondary: "#7c3aed",
        success: "#22c55e",
        warning: "#eab308",
        danger: "#ef4444",
        text: "#0f172a",
        lightText: "#64748b",
        background: "#ffffff",
        lightBackground: "#f1f5f9",
        border: "#e2e8f0",
      },
      blue: {
        primary: "#3b82f6",
        secondary: "#06b6d4",
        success: "#22c55e",
        warning: "#eab308",
        danger: "#ef4444",
        text: "#0f172a",
        lightText: "#64748b",
        background: "#ffffff",
        lightBackground: "#f1f5f9",
        border: "#e2e8f0",
      },
      green: {
        primary: "#22c55e",
        secondary: "#10b981",
        success: "#22c55e",
        warning: "#eab308",
        danger: "#ef4444",
        text: "#0f172a",
        lightText: "#64748b",
        background: "#ffffff",
        lightBackground: "#f1f5f9",
        border: "#e2e8f0",
      },
      grayscale: {
        primary: "#4b5563",
        secondary: "#6b7280",
        success: "#4b5563",
        warning: "#6b7280",
        danger: "#9ca3af",
        text: "#1f2937",
        lightText: "#6b7280",
        background: "#ffffff",
        lightBackground: "#f3f4f6",
        border: "#e5e7eb",
      },
    }

    return themes[theme as keyof typeof themes] || themes.default
  }

  // Color themes for reports
  private colorThemes = {
    default: {
      primary: [41, 98, 255],
      secondary: [124, 58, 237],
      success: [34, 197, 94],
      warning: [234, 179, 8],
      danger: [239, 68, 68],
      text: [15, 23, 42],
      lightText: [100, 116, 139],
      background: [255, 255, 255],
      lightBackground: [241, 245, 249],
    },
    blue: {
      primary: [59, 130, 246],
      secondary: [6, 182, 212],
      success: [34, 197, 94],
      warning: [234, 179, 8],
      danger: [239, 68, 68],
      text: [15, 23, 42],
      lightText: [100, 116, 139],
      background: [255, 255, 255],
      lightBackground: [241, 245, 249],
    },
    green: {
      primary: [34, 197, 94],
      secondary: [16, 185, 129],
      success: [34, 197, 94],
      warning: [234, 179, 8],
      danger: [239, 68, 68],
      text: [15, 23, 42],
      lightText: [100, 116, 139],
      background: [255, 255, 255],
      lightBackground: [241, 245, 249],
    },
    grayscale: {
      primary: [75, 85, 99],
      secondary: [107, 114, 128],
      success: [75, 85, 99],
      warning: [107, 114, 128],
      danger: [156, 163, 175],
      text: [31, 41, 55],
      lightText: [107, 114, 128],
      background: [255, 255, 255],
      lightBackground: [243, 244, 246],
    },
  }

  // Add the report header
  private addReportHeader(doc: jsPDF, title: string, theme: any): void {
    // Set the title
    doc.setFontSize(24)
    doc.setTextColor(theme.text[0], theme.text[1], theme.text[2])
    doc.text(title, 20, 20)

    // Add a line under the title
    doc.setDrawColor(theme.primary[0], theme.primary[1], theme.primary[2])
    doc.setLineWidth(0.5)
    doc.line(20, 25, 190, 25)

    // Add the date
    doc.setFontSize(10)
    doc.setTextColor(theme.lightText[0], theme.lightText[1], theme.lightText[2])
    doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 30)
  }

  // Add benchmark summary
  private addBenchmarkSummary(doc: jsPDF, result: BenchmarkResult, theme: any): void {
    doc.setFontSize(16)
    doc.setTextColor(theme.text[0], theme.text[1], theme.text[2])
    doc.text("Benchmark Summary", 20, 40)

    // Create a summary table
    doc.autoTable({
      startY: 45,
      head: [["Property", "Value"]],
      body: [
        ["Benchmark Name", result.name],
        ["Description", result.description || "N/A"],
        ["Date", new Date(result.timestamp).toLocaleString()],
        ["Total Duration", this.formatDuration(result.duration)],
        ["Operations", `${result.operations.length} operations`],
        ["Storage Mode", result.environment.storageMode],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [theme.primary[0], theme.primary[1], theme.primary[2]],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [theme.lightBackground[0], theme.lightBackground[1], theme.lightBackground[2]],
      },
      margin: { left: 20, right: 20 },
    })
  }

  // Add environment information
  private addEnvironmentInfo(doc: jsPDF, result: BenchmarkResult, theme: any): void {
    const currentY = (doc as any).lastAutoTable.finalY + 10

    doc.setFontSize(16)
    doc.setTextColor(theme.text[0], theme.text[1], theme.text[2])
    doc.text("Environment Information", 20, currentY)

    // Create an environment table
    doc.autoTable({
      startY: currentY + 5,
      head: [["Property", "Value"]],
      body: [
        ["Browser", result.environment.browser],
        ["Platform", result.environment.platform],
        ["Connection Speed", result.environment.connectionSpeed || "Unknown"],
        [
          "Memory Usage",
          result.environment.memoryUsage
            ? `${Math.round(result.environment.memoryUsage / (1024 * 1024))} MB`
            : "Unknown",
        ],
        ["Storage Mode", memoryStore.getStorageMode()],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [theme.secondary[0], theme.secondary[1], theme.secondary[2]],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [theme.lightBackground[0], theme.lightBackground[1], theme.lightBackground[2]],
      },
      margin: { left: 20, right: 20 },
    })
  }

  // Add operation details
  private addOperationDetails(doc: jsPDF, result: BenchmarkResult, theme: any): void {
    const currentY = (doc as any).lastAutoTable.finalY + 10

    doc.setFontSize(16)
    doc.setTextColor(theme.text[0], theme.text[1], theme.text[2])
    doc.text("Operation Details", 20, currentY)

    // Create a table for operation details
    const operationRows = result.operations.map((op) => [
      op.name,
      op.operationType,
      op.iterations.toString(),
      this.formatDuration(op.averageDuration),
      `${op.successRate.toFixed(1)}%`,
      op.errorCount.toString(),
    ])

    doc.autoTable({
      startY: currentY + 5,
      head: [["Operation", "Type", "Iterations", "Avg Duration", "Success Rate", "Errors"]],
      body: operationRows,
      theme: "grid",
      headStyles: {
        fillColor: [theme.primary[0], theme.primary[1], theme.primary[2]],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [theme.lightBackground[0], theme.lightBackground[1], theme.lightBackground[2]],
      },
      margin: { left: 20, right: 20 },
    })
  }

  // Add performance charts
  private addPerformanceCharts(doc: jsPDF, result: BenchmarkResult, theme: any): void {
    const currentY = (doc as any).lastAutoTable.finalY + 10

    doc.setFontSize(16)
    doc.setTextColor(theme.text[0], theme.text[1], theme.text[2])
    doc.text("Performance Charts", 20, currentY)

    // Add a new page if we're too close to the bottom
    if (currentY > 200) {
      doc.addPage()
      doc.setFontSize(16)
      doc.setTextColor(theme.text[0], theme.text[1], theme.text[2])
      doc.text("Performance Charts", 20, 20)
    }

    // Sort operations by average duration (descending)
    const sortedOperations = [...result.operations].sort((a, b) => b.averageDuration - a.averageDuration)

    // Draw a bar chart for average durations
    const chartStartY = currentY > 200 ? 30 : currentY + 10
    const chartWidth = 150
    const chartHeight = 80
    const barHeight = 10
    const maxBarWidth = chartWidth - 60 // Leave space for labels

    // Find the maximum duration for scaling
    const maxDuration = Math.max(...sortedOperations.map((op) => op.averageDuration))

    // Draw chart title
    doc.setFontSize(12)
    doc.setTextColor(theme.text[0], theme.text[1], theme.text[2])
    doc.text("Average Duration by Operation (ms)", 20, chartStartY)

    // Draw chart axes
    doc.setDrawColor(theme.lightText[0], theme.lightText[1], theme.lightText[2])
    doc.setLineWidth(0.2)
    doc.line(60, chartStartY + 5, 60, chartStartY + chartHeight) // Y-axis
    doc.line(60, chartStartY + chartHeight, 190, chartStartY + chartHeight) // X-axis

    // Draw bars
    sortedOperations.slice(0, 5).forEach((op, index) => {
      const barY = chartStartY + 10 + index * (barHeight + 5)
      const barWidth = (op.averageDuration / maxDuration) * maxBarWidth

      // Draw operation name
      doc.setFontSize(8)
      doc.setTextColor(theme.text[0], theme.text[1], theme.text[2])
      doc.text(this.truncateText(op.name, 8), 20, barY + barHeight / 2)

      // Draw bar
      doc.setFillColor(theme.primary[0], theme.primary[1], theme.primary[2])
      doc.rect(60, barY, barWidth, barHeight, "F")

      // Draw duration value
      doc.setFontSize(8)
      doc.setTextColor(theme.text[0], theme.text[1], theme.text[2])
      doc.text(this.formatDuration(op.averageDuration), 65 + barWidth, barY + barHeight / 2)
    })

    // Draw a pie chart for success rates
    const pieStartY = chartStartY + chartHeight + 20
    const pieRadius = 30
    const pieCenterX = 80
    const pieCenterY = pieStartY + pieRadius + 5

    // Check if we need a new page for the pie chart
    if (pieCenterY + pieRadius > 270) {
      doc.addPage()
      doc.setFontSize(12)
      doc.setTextColor(theme.text[0], theme.text[1], theme.text[2])
      doc.text("Success Rate by Operation", 20, 20)

      // Reset pie chart position
      const pieStartY = 30
      const pieCenterY = pieStartY + pieRadius + 5
    }

    // Draw pie chart title
    doc.setFontSize(12)
    doc.setTextColor(theme.text[0], theme.text[1], theme.text[2])
    doc.text("Success Rate by Operation", 20, pieStartY)

    // Draw success rate table instead of pie chart (simpler to implement)
    const successRateRows = result.operations.map((op) => [
      op.name,
      `${op.successRate.toFixed(1)}%`,
      op.errorCount.toString(),
    ])

    doc.autoTable({
      startY: pieStartY + 5,
      head: [["Operation", "Success Rate", "Error Count"]],
      body: successRateRows,
      theme: "grid",
      headStyles: {
        fillColor: [theme.success[0], theme.success[1], theme.success[2]],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [theme.lightBackground[0], theme.lightBackground[1], theme.lightBackground[2]],
      },
      margin: { left: 20, right: 20 },
    })
  }

  // Add comparison section
  private addComparisonSection(
    doc: jsPDF,
    mainResult: BenchmarkResult,
    comparisonResults: BenchmarkResult[],
    theme: any,
  ): void {
    // Add a new page for the comparison
    doc.addPage()

    doc.setFontSize(16)
    doc.setTextColor(theme.text[0], theme.text[1], theme.text[2])
    doc.text("Benchmark Comparison", 20, 20)

    // Create a summary table for the benchmarks being compared
    const benchmarkRows = [mainResult, ...comparisonResults].map((result) => [
      result.name,
      new Date(result.timestamp).toLocaleString(),
      this.formatDuration(result.duration),
      result.operations.length.toString(),
      result.environment.browser,
      result.environment.platform,
    ])

    doc.autoTable({
      startY: 30,
      head: [["Benchmark", "Date", "Duration", "Operations", "Browser", "Platform"]],
      body: benchmarkRows,
      theme: "grid",
      headStyles: {
        fillColor: [theme.primary[0], theme.primary[1], theme.primary[2]],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [theme.lightBackground[0], theme.lightBackground[1], theme.lightBackground[2]],
      },
      margin: { left: 20, right: 20 },
    })

    // Get all unique operation names across all benchmarks
    const allOperations = new Set<string>()
    ;[mainResult, ...comparisonResults].forEach((result) => {
      result.operations.forEach((op) => {
        allOperations.add(op.name)
      })
    })

    // Create a comparison table for average durations
    const comparisonRows: any[][] = []
    allOperations.forEach((opName) => {
      const row: any[] = [opName]

      // Add data for main result
      const mainOp = mainResult.operations.find((op) => op.name === opName)
      row.push(mainOp ? this.formatDuration(mainOp.averageDuration) : "N/A")

      // Add data for comparison results
      comparisonResults.forEach((result) => {
        const op = result.operations.find((op) => op.name === opName)
        row.push(op ? this.formatDuration(op.averageDuration) : "N/A")
      })

      comparisonRows.push(row)
    })

    // Create column headers
    const comparisonHeaders = ["Operation", mainResult.name]
    comparisonResults.forEach((result) => {
      comparisonHeaders.push(result.name)
    })

    doc.autoTable({
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [comparisonHeaders],
      body: comparisonRows,
      theme: "grid",
      headStyles: {
        fillColor: [theme.secondary[0], theme.secondary[1], theme.secondary[2]],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [theme.lightBackground[0], theme.lightBackground[1], theme.lightBackground[2]],
      },
      margin: { left: 20, right: 20 },
    })

    // Create a comparison table for success rates
    const successRateRows: any[][] = []
    allOperations.forEach((opName) => {
      const row: any[] = [opName]

      // Add data for main result
      const mainOp = mainResult.operations.find((op) => op.name === opName)
      row.push(mainOp ? `${mainOp.successRate.toFixed(1)}%` : "N/A")

      // Add data for comparison results
      comparisonResults.forEach((result) => {
        const op = result.operations.find((op) => op.name === opName)
        row.push(op ? `${op.successRate.toFixed(1)}%` : "N/A")
      })

      successRateRows.push(row)
    })

    doc.autoTable({
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [comparisonHeaders],
      body: successRateRows,
      theme: "grid",
      headStyles: {
        fillColor: [theme.success[0], theme.success[1], theme.success[2]],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [theme.lightBackground[0], theme.lightBackground[1], theme.lightBackground[2]],
      },
      margin: { left: 20, right: 20 },
    })
  }

  // Add notes section
  private addNotes(doc: jsPDF, notes: string, theme: any): void {
    // Add a new page for notes if needed
    if ((doc as any).lastAutoTable.finalY > 200) {
      doc.addPage()
      doc.setFontSize(16)
      doc.setTextColor(theme.text[0], theme.text[1], theme.text[2])
      doc.text("Notes", 20, 20)

      doc.setFontSize(10)
      doc.setTextColor(theme.text[0], theme.text[1], theme.text[2])

      // Split notes into lines
      const textLines = doc.splitTextToSize(notes, 170)
      doc.text(textLines, 20, 30)
    } else {
      const currentY = (doc as any).lastAutoTable.finalY + 10

      doc.setFontSize(16)
      doc.setTextColor(theme.text[0], theme.text[1], theme.text[2])
      doc.text("Notes", 20, currentY)

      doc.setFontSize(10)
      doc.setTextColor(theme.text[0], theme.text[1], theme.text[2])

      // Split notes into lines
      const textLines = doc.splitTextToSize(notes, 170)
      doc.text(textLines, 20, currentY + 10)
    }
  }

  // Add footer with page numbers
  private addFooter(doc: jsPDF, currentPage: number, totalPages: number, theme: any): void {
    doc.setFontSize(8)
    doc.setTextColor(theme.lightText[0], theme.lightText[1], theme.lightText[2])
    doc.text(`Page ${currentPage} of ${totalPages}`, 20, 285)
    doc.text("Generated with Mem0 Benchmark Report Generator", 105, 285, { align: "center" })
    doc.text(new Date().toLocaleString(), 190, 285, { align: "right" })
  }

  // Helper method to format duration
  private formatDuration(ms: number): string {
    if (ms < 1) return "< 1 ms"
    if (ms < 1000) return `${ms.toFixed(1)} ms`
    return `${(ms / 1000).toFixed(2)} s`
  }

  // Helper method to truncate text
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + "..."
  }
}

// Create a singleton instance
export const reportGenerator = new ReportGenerator()
