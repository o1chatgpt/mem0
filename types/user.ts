import type { RoleName } from "@/lib/permissions"

export interface User {
  id: string
  username: string
  email: string
  password?: string // Make password optional in the interface
  roles: RoleName[]
  createdAt: string
  updatedAt: string
  lastLogin?: string
  isActive: boolean
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  roles: RoleName[]
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  password?: string
  roles?: RoleName[]
  isActive?: boolean
}

export interface UserListResponse {
  users: User[]
  total: number
}

export interface UserActivityLog {
  id: string
  userId: string
  action: string
  timestamp: string
  details?: Record<string, any>
}
