import { NextResponse } from "next/server"
import { getAllUsers } from "@/lib/db"

export async function GET() {
  try {
    const users = await getAllUsers()

    // Remove sensitive information
    const sanitizedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      resetToken: user.resetToken,
      resetTokenExpiry: user.resetTokenExpiry,
      createdAt: user.createdAt,
    }))

    return NextResponse.json(sanitizedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
