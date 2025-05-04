import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { Permission, userHasPermission } from "@/lib/permissions"

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ hasPermission: false }, { status: 401 })
    }

    const { permission } = await request.json()

    if (!permission || !Object.values(Permission).includes(permission)) {
      return NextResponse.json({ error: "Invalid permission" }, { status: 400 })
    }

    const hasPermission = userHasPermission(session.roles, permission as Permission)

    return NextResponse.json({ hasPermission })
  } catch (error) {
    console.error("Error checking permission:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
