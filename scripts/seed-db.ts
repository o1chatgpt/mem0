import * as bcrypt from "bcryptjs"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "../lib/schema"
import { PERMISSIONS } from "../lib/auth-context"

async function main() {
  console.log("Seeding database...")

  // Initialize the database connection
  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql, { schema })

  // Create admin user
  const adminPassword = await bcrypt.hash("!June1872", 10)
  await db
    .insert(schema.users)
    .values({
      name: "Admin User",
      email: "gogiapandie@gmail.com",
      password: adminPassword,
      role: "admin",
      permissions: [PERMISSIONS.ADMIN],
    })
    .onConflictDoNothing()

  // Create system admin user
  const sysadminPassword = await bcrypt.hash("Admin123!", 10)
  await db
    .insert(schema.users)
    .values({
      name: "System Administrator",
      email: "sysadmin@example.com",
      password: sysadminPassword,
      role: "sysadmin",
      permissions: [PERMISSIONS.MANAGE_USERS, PERMISSIONS.MANAGE_API_KEYS, PERMISSIONS.INSTALL_PACKAGES],
    })
    .onConflictDoNothing()

  console.log("Database seeding completed!")
}

main().catch((error) => {
  console.error("Error seeding database:", error)
  process.exit(1)
})
