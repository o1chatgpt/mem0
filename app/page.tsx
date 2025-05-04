import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to the file explorer or login page
  redirect("/login")
}
