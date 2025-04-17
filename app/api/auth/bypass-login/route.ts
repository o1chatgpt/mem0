import { NextResponse } from "next/server"

export async function GET() {
  console.log("Bypass login initiated")

  // Create a response with a success message and redirect URL
  const response = NextResponse.json({
    success: true,
    message: "Bypass login successful",
    redirectUrl: "/",
  })

  // Set a more robust cookie with explicit options
  response.cookies.set({
    name: "bypass-auth",
    value: "admin-access-granted",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // Changed from lax to strict for better security
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  console.log("Bypass auth cookie set successfully")

  return response
}
