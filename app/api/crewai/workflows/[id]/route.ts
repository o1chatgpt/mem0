import { NextResponse } from "next/server"
import { getWorkflow, reviewWorkflow } from "@/lib/crewai/crewai-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const workflow = await getWorkflow(params.id)

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
    }

    return NextResponse.json({ workflow })
  } catch (error) {
    console.error("Error fetching workflow:", error)
    return NextResponse.json({ error: "Failed to fetch workflow" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    if (body.action === "approve" || body.action === "reject") {
      const result = await reviewWorkflow(params.id, body.action === "approve", body.notes)

      if (!result) {
        return NextResponse.json({ error: "Failed to review workflow" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating workflow:", error)
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 })
  }
}
