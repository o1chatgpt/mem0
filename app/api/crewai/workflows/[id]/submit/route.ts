import { NextResponse } from "next/server"
import { getWorkflow, submitWorkflowForApproval } from "@/lib/crewai/crewai-service"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const workflow = await getWorkflow(params.id)

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
    }

    // Check if workflow can be submitted
    if (workflow.status !== "draft") {
      return NextResponse.json({ error: "Only draft workflows can be submitted" }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const notes = body.notes || null

    const result = await submitWorkflowForApproval(params.id, notes)

    if (!result) {
      return NextResponse.json({ error: "Failed to submit workflow" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error submitting workflow:", error)
    return NextResponse.json({ error: "Failed to submit workflow" }, { status: 500 })
  }
}
