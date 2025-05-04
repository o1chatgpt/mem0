import { NextResponse } from "next/server"
import * as bcrypt from "bcryptjs"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("Starting database seeding...")

    // Check if we can connect to the database
    try {
      await sql`SELECT 1`
      console.log("Database connection successful")
    } catch (error) {
      console.error("Database connection failed:", error)
      return NextResponse.json(
        {
          status: "error",
          message: "Database connection failed. Using in-memory storage instead.",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }

    // Create users table if it doesn't exist
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          permissions TEXT[] NOT NULL DEFAULT '{}',
          reset_token TEXT,
          reset_token_expiry TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `
      console.log("Users table created or already exists")
    } catch (error) {
      console.error("Failed to create users table:", error)
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to create users table. Using in-memory storage instead.",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }

    // Create API keys table if it doesn't exist
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS api_keys (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          api_key TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          permissions TEXT[] NOT NULL,
          owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          last_used TIMESTAMP,
          active BOOLEAN DEFAULT TRUE
        )
      `
      console.log("API keys table created or already exists")
    } catch (error) {
      console.error("Failed to create API keys table:", error)
    }

    // Check if users table already has data
    let userCount = 0
    try {
      const result = await sql`SELECT COUNT(*) FROM users`
      userCount = Number.parseInt(result[0]?.count || "0")
      console.log(`Found ${userCount} existing users`)
    } catch (error) {
      console.error("Failed to count users:", error)
    }

    // If no users exist, create default users
    if (userCount === 0) {
      try {
        // Create admin user
        const adminPassword = await bcrypt.hash("!June1872", 10)
        await sql`
          INSERT INTO users (name, email, password, role, permissions)
          VALUES (
            'Admin User', 
            'gogiapandie@gmail.com', 
            ${adminPassword}, 
            'admin', 
            ARRAY['admin']
          )
        `
        console.log("Created admin user")

        // Create system admin user
        const sysadminPassword = await bcrypt.hash("Admin123!", 10)
        await sql`
          INSERT INTO users (name, email, password, role, permissions)
          VALUES (
            'System Administrator', 
            'sysadmin@example.com', 
            ${sysadminPassword}, 
            'sysadmin', 
            ARRAY['manage_users', 'manage_api_keys', 'install_packages']
          )
        `
        console.log("Created system admin user")
      } catch (error) {
        console.error("Failed to create default users:", error)
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Database seeding completed",
      databaseConnected: true,
      usersCreated: userCount === 0,
      defaultUsers: [
        { email: "gogiapandie@gmail.com", role: "admin" },
        { email: "sysadmin@example.com", role: "sysadmin" },
      ],
    })
  } catch (error) {
    console.error("Database seeding error:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to seed database",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
