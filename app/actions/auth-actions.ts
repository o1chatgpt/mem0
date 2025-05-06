"use server"

import { signToken, getUserByCredentials, type AuthResult } from "@/lib/auth-service"
import { cookies } from "next/headers"

export async function loginUser(username: string, password: string): Promise<AuthResult> {
  try {
    console.log("Login attempt:", username)

    // Get user by credentials
    const user = await getUserByCredentials(username, password)

    if (!user) {
      console.log("Login failed: Invalid credentials")
      return {
        success: false,
        error: "Invalid username or password",
        hint: "Please check your credentials and try again",
      }
    }

    // Generate JWT token
    const token = await signToken(user)

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

    console.log("Login successful:", user.username)

    return {
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
      },
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: "Authentication failed",
      hint: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function bypassLogin(): Promise<AuthResult> {
  try {
    console.log("Attempting bypass login")

    // Always allow bypass login for this project
    const demoUser = {
      id: "demo-1",
      username: "demo",
      role: "user" as const,
      permissions: ["files:read", "files:write", "files:share"],
    }

    // Generate JWT token
    const token = await signToken(demoUser)

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

    console.log("Bypass login successful")

    return {
      success: true,
      message: "Demo access granted",
      redirectUrl: "/",
      user: demoUser,
    }
  } catch (error) {
    console.error("Bypass login error:", error)
    return {
      success: false,
      error: "Demo access failed",
      hint: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function logoutUser(): Promise<AuthResult> {
  try {
    // Clear auth cookie
    cookies().set({
      name: "auth-token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    return {
      success: true,
      message: "Logout successful",
      redirectUrl: "/login",
    }
  } catch (error) {
    console.error("Logout error:", error)
    return {
      success: false,
      error: "Logout failed",
      hint: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
