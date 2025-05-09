import Link from "next/link"
import { cn } from "@/lib/utils"

interface MainNavProps {
  className?: string
}

export function MainNav({ className }: MainNavProps) {
  return (
    <div className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
        <span className="hidden sm:inline-block">File Manager</span>
      </Link>
    </div>
  )
}
