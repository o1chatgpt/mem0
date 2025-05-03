import { NextResponse } from "next/server"
import { userService } from "@/lib/user-service"
import { requirePermission } from "@/lib/auth"
import { Permission } from "@/lib/permissions"

// Get a user by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check permission
    const authResult = await requirePermission(request, Permission.VIEW_USERS)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const user = await userService.getUserById(params.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// Update a user
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check permission
    const authResult = await requirePermission(request, Permission.EDIT_USERS)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const userData = await request.json()
    const updatedUser = await userService.updateUser(params.id, userData)

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update user" },
      { status: 500 },
    )
  }
}

// Delete a user
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check permission
    const authResult = await requirePermission(request, Permission.DELETE_USERS)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const success = await userService.deleteUser(params.id)
    if (!success) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
