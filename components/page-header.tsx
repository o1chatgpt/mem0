"use client"

import { Breadcrumb } from "@/components/breadcrumb"
import { useBreadcrumb } from "@/components/breadcrumb-provider"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"
import { MobileNav } from "@/components/mobile-nav"

export function PageHeader() {
  const { breadcrumbs } = useBreadcrumb()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          onClick={() => setShowMobileMenu(true)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <Breadcrumb items={breadcrumbs} className="hidden md:flex" />
        <MobileNav open={showMobileMenu} onClose={() => setShowMobileMenu(false)} />
      </div>
    </header>
  )
}
