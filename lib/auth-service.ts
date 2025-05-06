import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import type { NextResponse } from "next/server"
import { config } from "./config"
import { createHash, randomBytes } from "crypto"

// Secret key for JWT signing
const SECRET_KEY = new TextEncoder().encode(config.jwtSecret || config.serverApiKey || "default-secret-key")

// Session duration
const SESSION_DURATION = "7d" // 7 days

export interface UserSession {
  id: string
  username: string
  role: "admin" | "user" | "partner"
  permissions: string[]
  exp?: number
}

export interface AuthResult {
  success: boolean
  message?: string
  error?: string
  hint?: string
  redirectUrl?: string
  user?: Omit<UserSession, "exp">
}

// Hash password with salt
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || randomBytes(16).toString("hex")
  const hash = createHash("sha256")
    .update(password + generatedSalt)
    .digest("hex")

  return { hash, salt: generatedSalt }
}

// Verify password
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: computedHash } = hashPassword(password, salt)
  return computedHash === hash
}

export async function signToken(payload: Omit<UserSession, "exp">): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(SECRET_KEY)
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload as UserSession
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    console.log("No auth token found in cookies")
    return null
  }

  return verifyToken(token)
}

export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set({
    name: "auth-token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  return response
}

export function removeAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: "auth-token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })

  return response
}

// Check if user has required permission
export function hasPermission(user: UserSession, permission: string): boolean {
  if (user.role === "admin") return true
  return user.permissions.includes(permission)
}

// Get user by credentials
export async function getUserByCredentials(username: string, password: string): Promise<UserSession | null> {
  // In a real app, this would query a database
  // For this example, we'll use the config values and some hardcoded users

  console.log("Attempting login with:", { username })

  // Admin user - Accept both "admin" and configured admin username
  if (
    (username === "admin" ||
      username === config.adminUsername ||
      username === config.adminEmail ||
      username === "admin@andiegogiap.com") &&
    (password === "!June1872" || password === config.serverApiKey || password === config.adminPassword)
  ) {
    console.log("Admin login successful")
    return {
      id: "admin-1",
      username: username,
      role: "admin",
      permissions: ["*"], // Admin has all permissions
    }
  }

  // Demo user - Always enable demo mode for this project
  if (username === "demo" && password === "demo") {
    console.log("Demo login successful")
    return {
      id: "demo-1",
      username: "demo",
      role: "user",
      permissions: ["files:read", "files:write", "files:share"],
    }
  }

  // Partner users (would come from database in real app)
  const partnerUsers = [
    {
      username: "partner1",
      password: "partner1pass",
      id: "partner-1",
      role: "partner" as const,
      permissions: ["files:read", "files:write", "files:share", "api:access"],
    },
    {
      username: "partner2",
      password: "partner2pass",
      id: "partner-2",
      role: "partner" as const,
      permissions: ["files:read", "files:share", "api:access"],
    },
  ]

  const partnerUser = partnerUsers.find((u) => u.username === username && u.password === password)
  if (partnerUser) {
    console.log("Partner login successful")
    return {
      id: partnerUser.id,
      username: partnerUser.username,
      role: partnerUser.role,
      permissions: partnerUser.permissions,
    }
  }

  console.log("Login failed: No matching user found")
  return null
}
