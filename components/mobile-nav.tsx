"use client"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { Sidebar } from "@/components/sidebar"

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full max-w-xs pr-0">
        <div className="flex items-center justify-between pr-4">
          <MainNav />
          <Button variant="ghost" onClick={onClose} className="p-0 h-8 w-8">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
          <Sidebar isCollapsed={false} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
