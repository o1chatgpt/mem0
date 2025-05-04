import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to the file explorer page
  redirect("/login")
}
