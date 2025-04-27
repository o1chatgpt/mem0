import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // This endpoint is no longer needed as we're accessing the WebContainer directly
    // from the client side. We'll return a message indicating this.
    return NextResponse.json({
      message: "WebContainer files are now accessed directly from the client side.",
      redirectTo: "/container-preview",
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
