"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface AiMemberFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function AiMemberForm({ onSubmit, onCancel }: AiMemberFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const data = Object.fromEntries(formData.entries())
    onSubmit(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New AI Family Member</CardTitle>
        <CardDescription>Fill in the details for the new AI Family member</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="member-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Enter name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" name="role" placeholder="Enter role" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty</Label>
            <Input id="specialty" name="specialty" placeholder="Enter specialty" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Enter description" required />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" form="member-form">
          Create
        </Button>
      </CardFooter>
    </Card>
  )
}
