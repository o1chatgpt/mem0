"use client"

import { DatabaseMigrations } from "@/components/database-migrations"

export default function DatabasePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-2 text-3xl font-bold">Database Management</h1>
      <p className="mb-8 text-lg text-muted-foreground">Manage your database schema and migrations</p>

      <div className="space-y-8">
        <DatabaseMigrations />
      </div>
    </div>
  )
}
