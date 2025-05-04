import { NextResponse } from "next/server"
import { userService } from "@/lib/user-service"
import { requirePermission } from "@/lib/auth"
import { Permission } from "@/lib/permissions"

// Get all users
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")

    // Check permission
    const authResult = await requirePermission(request, Permission.VIEW_USERS)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const result = await userService.getUsers(page, limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// Create a new user
export async function POST(request: Request) {
  try {
    // Check permission
    const authResult = await requirePermission(request, Permission.CREATE_USERS)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const userData = await request.json()

    // Validate required fields
    if (!userData.username || !userData.email || !userData.password || !userData.roles) {
      return NextResponse.json({ error: "Username, email, password, and roles are required" }, { status: 400 })
    }

    // Check if user already exists
    const exists = await userService.userExists(userData.username, userData.email)
    if (exists) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 409 })
    }

    const newUser = await userService.createUser(userData)
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create user" },
      { status: 500 },
    )
  }
}
