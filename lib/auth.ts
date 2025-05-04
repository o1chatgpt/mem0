import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare, hash } from "bcryptjs"

// In-memory user store for authentication
// In a production environment, you would replace this with a database
const users = [
  {
    id: "1",
    name: "Admin User",
    email: "gogiapandie@gmail.com",
    // Hashed password for "!June1872"
    password: "$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm",
    role: "admin",
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const user = users.find((user) => user.email === credentials.email)
          if (!user) {
            return null
          }

          const isPasswordValid = await compare(credentials.password, user.password)
          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
}

// Helper function to create a new user (for demonstration purposes)
export async function createUser(name: string, email: string, password: string, role = "user") {
  try {
    const hashedPassword = await hash(password, 10)
    const id = (users.length + 1).toString()

    const newUser = {
      id,
      name,
      email,
      password: hashedPassword,
      role,
    }

    users.push(newUser)
    return { id, name, email, role }
  } catch (error) {
    console.error("Error creating user:", error)
    throw new Error("Failed to create user")
  }
}
