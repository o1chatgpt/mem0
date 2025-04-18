import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { serverConfig } from "./server-config"

// Create the secret key in a function to avoid build-time evaluation
const getSecretKey = () => {
  return new TextEncoder().encode(serverConfig.jwtSecret)
}

export interface UserSession {
  id: string
  username: string
  role: "admin" | "user"
  exp?: number
}

export async function signToken(payload: Omit<UserSession, "exp">): Promise<string> {
  const SECRET_KEY = getSecretKey()
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Extend to 7 days
    .sign(SECRET_KEY)
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const SECRET_KEY = getSecretKey()
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload as UserSession
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

// Rest of the file remains unchanged
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

export async function requireAuth(request: NextRequest): Promise<UserSession | NextResponse> {
  const cookieStore = cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    console.log("No auth token found in cookies, redirecting to login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const session = await verifyToken(token)
  if (!session) {
    console.log("Invalid auth token, redirecting to login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return session
}

export async function requireAdmin(request: NextRequest): Promise<UserSession | NextResponse> {
  const result = await requireAuth(request)

  if (result instanceof NextResponse) {
    return result
  }

  if (result.role !== "admin") {
    console.log("User is not an admin, redirecting to unauthorized")
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  return result
}
