"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

// Define user type
type User = {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
}

// Define authentication context type
type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (name: string, email: string, password: string, role?: string) => Promise<boolean>
  requestPasswordReset: (email: string) => Promise<{ success: boolean; token?: string }>
  resetPassword: (token: string, newPassword: string) => Promise<boolean>
  isAdmin: () => boolean
  hasPermission: (permission: string) => boolean
  isLoading: boolean
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Define available permissions
export const PERMISSIONS = {
  MANAGE_USERS: "manage_users",
  MANAGE_API_KEYS: "manage_api_keys",
  INSTALL_PACKAGES: "install_packages",
  RUN_CONTAINERS: "run_containers",
  ADMIN: "admin",
}

// In-memory user store for authentication
const users = [
  {
    id: "1",
    name: "Admin User",
    email: "gogiapandie@gmail.com",
    password: "!June1872", // Plain text for simplicity
    role: "admin",
    permissions: [PERMISSIONS.ADMIN],
  },
]

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Login function - simplified to use plain text passwords
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Find user in the in-memory store
      const foundUser = users.find((u) => u.email === email)

      if (!foundUser) {
        return false
      }

      // Simple password check (no bcrypt)
      const isPasswordValid = foundUser.password === password
      if (!isPasswordValid) {
        return false
      }

      // Create user object without password
      const userWithoutPassword: User = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role || "user",
        permissions: foundUser.permissions || [],
      }

      // Store user in state and localStorage
      setUser(userWithoutPassword)

      try {
        localStorage.setItem("user", JSON.stringify(userWithoutPassword))
        console.log("User saved to localStorage:", userWithoutPassword)
      } catch (error) {
        console.error("Error saving user to localStorage:", error)
      }

      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem("user")
    } catch (error) {
      console.error("Error removing user from localStorage:", error)
    }
    router.push("/login")
  }

  // Register function - simplified
  const register = async (name: string, email: string, password: string, role = "user"): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUser = users.find((u) => u.email === email)

      if (existingUser) {
        return false
      }

      // Determine permissions based on role
      let permissions: string[] = []
      if (role === "admin") {
        permissions = [PERMISSIONS.ADMIN]
      } else if (role === "sysadmin") {
        permissions = [PERMISSIONS.MANAGE_USERS, PERMISSIONS.MANAGE_API_KEYS, PERMISSIONS.INSTALL_PACKAGES]
      } else {
        permissions = [PERMISSIONS.RUN_CONTAINERS]
      }

      // Add user to in-memory store
      const id = (users.length + 1).toString()
      users.push({
        id,
        name,
        email,
        password, // Plain text for simplicity
        role,
        permissions,
      })

      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  // Request password reset function - simplified
  const requestPasswordReset = async (email: string): Promise<{ success: boolean; token?: string }> => {
    try {
      const user = users.find((u) => u.email === email)

      if (!user) {
        return { success: false }
      }

      // Generate a simple token
      const token = Math.random().toString(36).substring(2, 15)

      // In a real app, you would store this token and its expiry
      // For this demo, we'll just return it
      return { success: true, token }
    } catch (error) {
      console.error("Password reset request error:", error)
      return { success: false }
    }
  }

  // Reset password function - simplified
  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    // In a real app, you would validate the token
    // For this demo, we'll just return true
    return true
  }

  // Check if user is an admin
  const isAdmin = (): boolean => {
    return !!user && (user.role === "admin" || user.permissions.includes(PERMISSIONS.ADMIN))
  }

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return user.permissions.includes(permission) || user.permissions.includes(PERMISSIONS.ADMIN)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        requestPasswordReset,
        resetPassword,
        isAdmin,
        hasPermission,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
