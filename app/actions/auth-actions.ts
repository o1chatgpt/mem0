"use server"

import { cookies } from "next/headers"
import { getUserByCredentials, signToken, setAuthCookie, type AuthResult } from "@/lib/auth-service"
import { config } from "@/lib/config"
import { NextResponse } from "next/server"

export async function loginUser(username: string, password: string): Promise<AuthResult> {
  try {
    console.log("Login attempt:", {
      username,
      providedPasswordLength: password ? password.length : 0,
    })

    // Get user by credentials
    const user = await getUserByCredentials(username, password)

    if (!user) {
      return {
        success: false,
        error: "Invalid username or password",
        hint: "Use your registered username and password to log in",
      }
    }

    // Create a session token
    const token = await signToken(user)

    // Set the auth cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        username: user.username,
        role: user.role,
      },
    })

    setAuthCookie(response, token)

    // Set cookies manually since we're in a server action
    cookies().set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

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
    }
  }
}

export async function logoutUser(): Promise<AuthResult> {
  try {
    // Clear the auth cookie
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
    }
  } catch (error) {
    console.error("Logout error:", error)
    return {
      success: false,
      error: "Logout failed",
    }
  }
}

export async function bypassLogin(): Promise<AuthResult> {
  try {
    console.log("Bypass login initiated")

    // For demo mode, create an admin session
    if (config.enableDemoMode) {
      const token = await signToken({
        id: "demo-admin",
        username: "admin",
        role: "admin",
        permissions: ["*"],
      })

      // Set the auth cookie
      cookies().set({
        name: "auth-token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })

      return {
        success: true,
        message: "Bypass login successful",
        redirectUrl: "/",
      }
    }

    return {
      success: false,
      error: "Bypass login is only available in demo mode",
    }
  } catch (error) {
    console.error("Bypass login error:", error)
    return {
      success: false,
      error: "Authentication failed",
    }
  }
}
