"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { roles, Permission, type RoleName } from "@/lib/permissions"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { PermissionGuard } from "@/components/permission-guard"

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<RoleName>("viewer")
  const [customPermissions, setCustomPermissions] = useState<Permission[]>([])

  // Initialize custom permissions when role changes
  useEffect(() => {
    if (selectedRole === "custom") {
      setCustomPermissions([])
    } else {
      setCustomPermissions(roles[selectedRole].permissions)
    }
  }, [selectedRole])

  const handlePermissionToggle = (permission: Permission) => {
    setCustomPermissions((prev) => {
      if (prev.includes(permission)) {
        return prev.filter((p) => p !== permission)
      } else {
        return [...prev, permission]
      }
    })
  }

  return (
    <PermissionGuard
      permission={Permission.MANAGE_SYSTEM}
      fallback={<div>You do not have permission to view this page.</div>}
    >
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Role Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Roles</CardTitle>
              <CardDescription>Select a role to view or edit its permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.values(roles).map((role) => (
                  <Button
                    key={role.name}
                    variant={selectedRole === role.name ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedRole(role.name)}
                  >
                    {role.displayName}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{roles[selectedRole].displayName}</CardTitle>
              <CardDescription>{roles[selectedRole].description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(Permission).map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission}
                      checked={customPermissions.includes(permission)}
                      onCheckedChange={() => handlePermissionToggle(permission)}
                      disabled={selectedRole !== "custom" && selectedRole !== "admin"}
                    />
                    <Label htmlFor={permission} className="text-sm">
                      {permission}
                    </Label>
                  </div>
                ))}
              </div>

              {selectedRole === "custom" && (
                <div className="mt-6">
                  <Button className="mr-2">Save Custom Role</Button>
                  <Button variant="outline">Reset</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>User Role Assignments</CardTitle>
            <CardDescription>Assign roles to users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This feature would allow you to assign roles to specific users. In a production environment, this would be
              connected to your user database.
            </p>
            <Button disabled>Manage User Roles</Button>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  )
}
