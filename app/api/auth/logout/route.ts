import { NextResponse } from "next/server"

export async function POST() {
  try {
    const response = NextResponse.json({ success: true })

    // Clear the auth token cookie
    response.cookies.set({
      name: "auth-token",
      value: "",
      expires: new Date(0),
      path: "/",
    })

    // Also clear any bypass auth cookie
    response.cookies.set({
      name: "bypass-auth",
      value: "",
      expires: new Date(0),
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}
