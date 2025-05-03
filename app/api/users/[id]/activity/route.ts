import { NextResponse } from "next/server"
import { userService } from "@/lib/user-service"
import { requirePermission } from "@/lib/auth"
import { Permission } from "@/lib/permissions"

// Get user activity logs
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check permission
    const authResult = await requirePermission(request, Permission.VIEW_USERS)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")

    const logs = await userService.getUserActivityLogs(params.id, limit)
    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Error fetching user activity:", error)
    return NextResponse.json({ error: "Failed to fetch user activity" }, { status: 500 })
  }
}
