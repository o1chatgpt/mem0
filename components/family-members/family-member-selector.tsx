"use client"

import { useMem0 } from "@/components/mem0/mem0-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, User, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

export function FamilyMemberSelector() {
  const { familyMembers, currentFamilyMember, setCurrentFamilyMember } = useMem0()
  const router = useRouter()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {currentFamilyMember ? (
            <>
              <Avatar className="h-6 w-6">
                {currentFamilyMember.avatar ? (
                  <AvatarImage src={currentFamilyMember.avatar || "/placeholder.svg"} alt={currentFamilyMember.name} />
                ) : null}
                <AvatarFallback className="text-xs">{getInitials(currentFamilyMember.name)}</AvatarFallback>
              </Avatar>
              <span className="max-w-[100px] truncate">{currentFamilyMember.name}</span>
            </>
          ) : (
            <>
              <User className="h-4 w-4" />
              <span>Select AI</span>
            </>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>AI Family Members</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {familyMembers.map((member) => (
          <DropdownMenuItem key={member.id} className="cursor-pointer" onClick={() => setCurrentFamilyMember(member)}>
            <Avatar className="h-6 w-6 mr-2">
              {member.avatar ? <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} /> : null}
              <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span>{member.name}</span>
              <span className="text-xs text-muted-foreground">{member.role}</span>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/family-members")}>
          <Settings className="h-4 w-4 mr-2" />
          Manage Family Members
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
