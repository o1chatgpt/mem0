/**
 * Permission and role-based access control system
 */

// Define all possible permissions in the system
export enum Permission {
  // File operations
  VIEW_FILES = "view:files",
  CREATE_FILES = "create:files",
  EDIT_FILES = "edit:files",
  DELETE_FILES = "delete:files",
  DOWNLOAD_FILES = "download:files",
  UPLOAD_FILES = "upload:files",

  // Server operations
  VIEW_SERVER = "view:server",
  MANAGE_SERVER = "manage:server",

  // Website operations
  VIEW_WEBSITES = "view:websites",
  CREATE_WEBSITES = "create:websites",
  EDIT_WEBSITES = "edit:websites",
  DELETE_WEBSITES = "delete:websites",

  // AI operations
  VIEW_AI = "view:ai",
  MANAGE_AI = "manage:ai",

  // User management
  VIEW_USERS = "view:users",
  CREATE_USERS = "create:users",
  EDIT_USERS = "edit:users",
  DELETE_USERS = "delete:users",

  // Settings
  VIEW_SETTINGS = "view:settings",
  EDIT_SETTINGS = "edit:settings",

  // System operations
  VIEW_SYSTEM = "view:system",
  MANAGE_SYSTEM = "manage:system",

  // Memory operations
  VIEW_MEMORY = "view:memory",
  MANAGE_MEMORY = "manage:memory",
}

// Define role types
export type RoleName =
  | "admin"
  | "editor"
  | "contributor"
  | "viewer"
  | "server-admin"
  | "website-admin"
  | "ai-admin"
  | "custom"

// Define role interface
export interface Role {
  name: RoleName
  displayName: string
  description: string
  permissions: Permission[]
  inheritsFrom?: RoleName[]
}

// Define the roles and their permissions
export const roles: Record<RoleName, Role> = {
  admin: {
    name: "admin",
    displayName: "Administrator",
    description: "Full access to all system features",
    permissions: Object.values(Permission), // All permissions
  },

  editor: {
    name: "editor",
    displayName: "Editor",
    description: "Can edit content but cannot manage system settings",
    permissions: [
      Permission.VIEW_FILES,
      Permission.CREATE_FILES,
      Permission.EDIT_FILES,
      Permission.DELETE_FILES,
      Permission.DOWNLOAD_FILES,
      Permission.UPLOAD_FILES,
      Permission.VIEW_WEBSITES,
      Permission.EDIT_WEBSITES,
      Permission.VIEW_AI,
      Permission.VIEW_MEMORY,
    ],
  },

  contributor: {
    name: "contributor",
    displayName: "Contributor",
    description: "Can add and edit their own content",
    permissions: [
      Permission.VIEW_FILES,
      Permission.CREATE_FILES,
      Permission.EDIT_FILES,
      Permission.DOWNLOAD_FILES,
      Permission.UPLOAD_FILES,
      Permission.VIEW_WEBSITES,
      Permission.VIEW_AI,
      Permission.VIEW_MEMORY,
    ],
  },

  viewer: {
    name: "viewer",
    displayName: "Viewer",
    description: "Read-only access to content",
    permissions: [
      Permission.VIEW_FILES,
      Permission.DOWNLOAD_FILES,
      Permission.VIEW_WEBSITES,
      Permission.VIEW_AI,
      Permission.VIEW_MEMORY,
    ],
  },

  "server-admin": {
    name: "server-admin",
    displayName: "Server Administrator",
    description: "Manages server infrastructure",
    permissions: [
      Permission.VIEW_SERVER,
      Permission.MANAGE_SERVER,
      Permission.VIEW_SYSTEM,
      Permission.VIEW_FILES,
      Permission.DOWNLOAD_FILES,
    ],
    inheritsFrom: ["viewer"],
  },

  "website-admin": {
    name: "website-admin",
    displayName: "Website Administrator",
    description: "Manages websites and web content",
    permissions: [
      Permission.VIEW_WEBSITES,
      Permission.CREATE_WEBSITES,
      Permission.EDIT_WEBSITES,
      Permission.DELETE_WEBSITES,
      Permission.VIEW_FILES,
      Permission.CREATE_FILES,
      Permission.EDIT_FILES,
      Permission.DELETE_FILES,
      Permission.UPLOAD_FILES,
      Permission.DOWNLOAD_FILES,
    ],
  },

  "ai-admin": {
    name: "ai-admin",
    displayName: "AI Administrator",
    description: "Manages AI features and memory",
    permissions: [Permission.VIEW_AI, Permission.MANAGE_AI, Permission.VIEW_MEMORY, Permission.MANAGE_MEMORY],
    inheritsFrom: ["viewer"],
  },

  custom: {
    name: "custom",
    displayName: "Custom Role",
    description: "Custom permissions set",
    permissions: [], // Empty by default, to be filled with custom permissions
  },
}

// Helper function to get all permissions for a role, including inherited ones
export function getAllPermissionsForRole(roleName: RoleName): Permission[] {
  const role = roles[roleName]
  if (!role) {
    return []
  }

  let allPermissions = [...role.permissions]

  // Add inherited permissions
  if (role.inheritsFrom) {
    for (const parentRole of role.inheritsFrom) {
      allPermissions = [...allPermissions, ...getAllPermissionsForRole(parentRole)]
    }
  }

  // Remove duplicates
  return [...new Set(allPermissions)]
}

// Helper function to check if a role has a specific permission
export function hasPermission(roleName: RoleName, permission: Permission): boolean {
  const allPermissions = getAllPermissionsForRole(roleName)
  return allPermissions.includes(permission)
}

// Helper function to check if a user has a specific permission
export function userHasPermission(userRoles: RoleName[], permission: Permission): boolean {
  return userRoles.some((role) => hasPermission(role, permission))
}

// Create a custom role with specific permissions
export function createCustomRole(displayName: string, description: string, permissions: Permission[]): Role {
  return {
    name: "custom",
    displayName,
    description,
    permissions,
  }
}
