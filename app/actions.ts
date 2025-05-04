"use server"

import { cookies } from "next/headers"
import { signToken } from "@/lib/auth"

export async function loginAction(prevState: any, formData: FormData) {
  // Extract form data
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  // Validate inputs
  if (!username || !password) {
    return { error: "Username and password are required" }
  }

  // Check credentials
  let userId = ""
  let userRoles: string[] = []
  let userEmail = ""
  let isAuthenticated = false

  if (username === "admin" && password === "!July1872") {
    userId = "admin-user"
    userRoles = ["admin"]
    userEmail = "admin@example.com"
    isAuthenticated = true
  } else if (username === "editor" && password === "editor") {
    userId = "editor-user"
    userRoles = ["editor"]
    userEmail = "editor@example.com"
    isAuthenticated = true
  } else if (username === "viewer" && password === "viewer") {
    userId = "viewer-user"
    userRoles = ["viewer"]
    userEmail = "viewer@example.com"
    isAuthenticated = true
  }

  if (!isAuthenticated) {
    return { error: "Invalid username or password" }
  }

  try {
    // Create token
    const token = await signToken({
      id: userId,
      username,
      email: userEmail,
      roles: userRoles,
    })

    // Set cookie
    cookies().set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    // Log success
    console.log("Login successful")

    // Return success and redirect URL instead of using redirect()
    return { success: true, redirectUrl: "/" }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An error occurred during login" }
  }
}
