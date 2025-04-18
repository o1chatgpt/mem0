import { type NextRequest, NextResponse } from "next/server"
import { createTemplateTest, getTestTemplate, recordTestImpression, recordTestUsage, completeTest } from "@/lib/mem0"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case "createTest":
        const newTest = await createTemplateTest(data.test)
        return NextResponse.json({ success: true, test: newTest })

      case "getTemplate":
        const template = await getTestTemplate(data.testId, data.userId, data.variation)
        return NextResponse.json({ success: true, template })

      case "recordImpression":
        await recordTestImpression(data.testId, data.variation)
        return NextResponse.json({ success: true })

      case "recordUsage":
        await recordTestUsage(data.testId, data.variation, data.metrics)
        return NextResponse.json({ success: true })

      case "completeTest":
        const result = await completeTest(data.testId)
        return NextResponse.json({ success: true, result })

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in template tests API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
