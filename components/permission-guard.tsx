"use client"

import { type ReactNode, useEffect, useState } from "react"
import type { Permission } from "@/lib/permissions"
import { usePermissions } from "@/hooks/use-permissions"

interface PermissionGuardProps {
  permission: Permission
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { hasPermission } = usePermissions()
  const [canAccess, setCanAccess] = useState<boolean | null>(null)

  useEffect(() => {
    const checkPermission = async () => {
      const result = await hasPermission(permission)
      setCanAccess(result)
    }

    checkPermission()
  }, [hasPermission, permission])

  // Show nothing while checking permissions
  if (canAccess === null) {
    return null
  }

  return canAccess ? <>{children}</> : <>{fallback}</>
}
