import { v4 as uuidv4 } from "uuid"
import type { User, CreateUserRequest, UpdateUserRequest, UserListResponse, UserActivityLog } from "@/types/user"
import { roles } from "@/lib/permissions"

// Update the admin user in the users array to use the provided credentials
const users: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    password: "!July1872", // Store the password for the mock implementation
    roles: ["admin"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "2",
    username: "editor",
    email: "editor@example.com",
    roles: ["editor"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "3",
    username: "viewer",
    email: "viewer@example.com",
    roles: ["viewer"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
  },
]

// In a real application, this would be stored in a database
const activityLogs: UserActivityLog[] = [
  {
    id: "1",
    userId: "1",
    action: "login",
    timestamp: new Date().toISOString(),
    details: { ip: "192.168.1.1" },
  },
  {
    id: "2",
    userId: "1",
    action: "create_file",
    timestamp: new Date().toISOString(),
    details: { fileName: "document.txt" },
  },
  {
    id: "3",
    userId: "2",
    action: "login",
    timestamp: new Date().toISOString(),
    details: { ip: "192.168.1.2" },
  },
]

export class UserService {
  // Get all users with pagination
  async getUsers(page = 1, limit = 10): Promise<UserListResponse> {
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedUsers = users.slice(start, end)

    return {
      users: paginatedUsers,
      total: users.length,
    }
  }

  // Get a user by ID
  async getUserById(id: string): Promise<User | null> {
    const user = users.find((u) => u.id === id)
    return user || null
  }

  // Create a new user
  async createUser(userData: CreateUserRequest): Promise<User> {
    // Check if username or email already exists
    const existingUser = users.find((u) => u.username === userData.username || u.email === userData.email)
    if (existingUser) {
      throw new Error("Username or email already exists")
    }

    // Validate roles
    userData.roles.forEach((role) => {
      if (!roles[role]) {
        throw new Error(`Invalid role: ${role}`)
      }
    })

    const now = new Date().toISOString()
    const newUser: User = {
      id: uuidv4(),
      username: userData.username,
      email: userData.email,
      roles: userData.roles,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    }

    users.push(newUser)

    // Log activity
    this.logActivity(newUser.id, "user_created", { createdBy: "system" })

    return newUser
  }

  // Update a user
  async updateUser(id: string, userData: UpdateUserRequest): Promise<User | null> {
    const userIndex = users.findIndex((u) => u.id === id)
    if (userIndex === -1) {
      return null
    }

    // Check if username or email already exists (if being updated)
    if (userData.username || userData.email) {
      const existingUser = users.find(
        (u) =>
          u.id !== id &&
          ((userData.username && u.username === userData.username) || (userData.email && u.email === userData.email)),
      )
      if (existingUser) {
        throw new Error("Username or email already exists")
      }
    }

    // Validate roles
    if (userData.roles) {
      userData.roles.forEach((role) => {
        if (!roles[role]) {
          throw new Error(`Invalid role: ${role}`)
        }
      })
    }

    const updatedUser: User = {
      ...users[userIndex],
      ...userData,
      updatedAt: new Date().toISOString(),
    }

    users[userIndex] = updatedUser

    // Log activity
    this.logActivity(id, "user_updated", { updatedFields: Object.keys(userData) })

    return updatedUser
  }

  // Delete a user
  async deleteUser(id: string): Promise<boolean> {
    const userIndex = users.findIndex((u) => u.id === id)
    if (userIndex === -1) {
      return false
    }

    users.splice(userIndex, 1)

    // Log activity
    this.logActivity(id, "user_deleted", { deletedBy: "system" })

    return true
  }

  // Update user's last login
  async updateLastLogin(id: string): Promise<void> {
    const userIndex = users.findIndex((u) => u.id === id)
    if (userIndex !== -1) {
      users[userIndex].lastLogin = new Date().toISOString()
    }
  }

  // Log user activity
  async logActivity(userId: string, action: string, details?: Record<string, any>): Promise<UserActivityLog> {
    const log: UserActivityLog = {
      id: uuidv4(),
      userId,
      action,
      timestamp: new Date().toISOString(),
      details,
    }

    activityLogs.push(log)
    return log
  }

  // Get user activity logs
  async getUserActivityLogs(userId: string, limit = 10): Promise<UserActivityLog[]> {
    return activityLogs
      .filter((log) => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  // Get all activity logs
  async getAllActivityLogs(page = 1, limit = 10): Promise<{ logs: UserActivityLog[]; total: number }> {
    const start = (page - 1) * limit
    const end = start + limit
    const sortedLogs = [...activityLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    const paginatedLogs = sortedLogs.slice(start, end)

    return {
      logs: paginatedLogs,
      total: activityLogs.length,
    }
  }

  // Check if a user exists by username or email
  async userExists(username: string, email: string): Promise<boolean> {
    return users.some((u) => u.username === username || u.email === email)
  }

  // Get user by username
  async getUserByUsername(username: string): Promise<User | null> {
    const user = users.find((u) => u.username === username)
    return user || null
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const user = users.find((u) => u.email === email)
    return user || null
  }
}

// Export a singleton instance
export const userService = new UserService()
