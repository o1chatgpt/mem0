import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { Permission, type RoleName, userHasPermission } from "./permissions"

// Secret key for JWT signing
const secretKey = process.env.JWT_SECRET_KEY || "your-default-secret-key"
const secret = new TextEncoder().encode(secretKey)

// Define user session interface with expanded role support
export interface UserSession {
  id: string
  username: string
  email?: string
  roles: RoleName[]
  permissions?: Permission[]
  exp?: number
}

// Sign a JWT token with user session data
export async function signToken(payload: Omit<UserSession, "exp">): Promise<string> {
  try {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("7d") // Token expires in 7 days
      .sign(secret)
  } catch (error) {
    console.error("Error signing token:", error)
    throw new Error("Failed to sign token")
  }
}

// Verify a JWT token
export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as UserSession
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

// Get the current user session from cookies
export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    return verifyToken(token)
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

// Set auth cookie in response
export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  // Log the token being set (only first few characters for security)
  console.log("Setting auth cookie with token:", token.substring(0, 10) + "...")

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

// Remove auth cookie from response
export function removeAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: "auth-token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // Expire immediately
    path: "/",
  })

  return response
}

// Check if the current user has a specific permission
export async function checkPermission(permission: Permission): Promise<boolean> {
  const session = await getSession()
  if (!session) {
    return false
  }

  return userHasPermission(session.roles, permission)
}

// Require authentication middleware
export async function requireAuth(request: NextRequest): Promise<UserSession | NextResponse> {
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const session = await verifyToken(token)
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return session
}

// Require specific permission middleware
export async function requirePermission(
  request: NextRequest,
  permission: Permission,
): Promise<UserSession | NextResponse> {
  const result = await requireAuth(request)

  if (result instanceof NextResponse) {
    return result
  }

  if (!userHasPermission(result.roles, permission)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  return result
}

// Legacy function for backward compatibility
export async function requireAdmin(request: NextRequest): Promise<UserSession | NextResponse> {
  return requirePermission(request, Permission.MANAGE_SYSTEM)
}
