import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to the dashboard
  redirect("/dashboard")
}
