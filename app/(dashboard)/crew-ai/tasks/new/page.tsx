"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useCrewAI } from "@/components/crew-ai-provider"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function NewTaskPage() {
  const router = useRouter()
  const { agents, createNewTask, findBestAgent } = useCrewAI()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [dueDate, setDueDate] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [skillInput, setSkillInput] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [suggestedAgent, setSuggestedAgent] = useState<any>(null)
  const [isFindingAgent, setIsFindingAgent] = useState(false)

  // Add a skill
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput("")
    }
  }

  // Remove a skill
  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  // Find the best agent for this task
  const handleFindBestAgent = async () => {
    if (!title || !description || skills.length === 0) return

    setIsFindingAgent(true)
    try {
      const agent = await findBestAgent({
        title,
        description,
        skills_required: skills,
        assigned_to: null,
        created_by: "user",
        status: "pending",
        priority,
      })

      setSuggestedAgent(agent)
      if (agent) {
        setAssignedTo(agent.id)
      }
    } catch (error) {
      console.error("Error finding best agent:", error)
    } finally {
      setIsFindingAgent(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description) return

    setIsSubmitting(true)
    try {
      const newTask = await createNewTask({
        title,
        description,
        assigned_to: assignedTo || null,
        created_by: "user",
        status: assignedTo ? "assigned" : "pending",
        priority,
        due_date: dueDate || undefined,
        skills_required: skills,
      })

      if (newTask) {
        router.push(`/crew-ai/tasks/${newTask.id}`)
      }
    } catch (error) {
      console.error("Error creating task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/crew-ai/tasks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Create New Task</h1>
        <p className="text-lg text-muted-foreground">Assign a task to an AI family member</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed task description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={(value) => setPriority(value as "low" | "medium" | "high")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Required Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      id="skills"
                      placeholder="Add a required skill"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill} disabled={!skillInput.trim()}>
                      Add
                    </Button>
                  </div>

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <button
                            type="button"
                            className="ml-1 rounded-full h-4 w-4 inline-flex items-center justify-center text-xs"
                            onClick={() => removeSkill(skill)}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFindBestAgent}
                  disabled={isFindingAgent || !title || !description || skills.length === 0}
                >
                  {isFindingAgent ? "Finding..." : "Find Best Agent"}
                </Button>
                <Button type="submit" disabled={isSubmitting || !title || !description}>
                  {isSubmitting ? "Creating..." : "Create Task"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Assign Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select agent (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} ({agent.specialty})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {suggestedAgent && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Suggested Agent</h3>
                  <div className="rounded-md border p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={suggestedAgent.avatar_url || "/placeholder.svg"} alt={suggestedAgent.name} />
                        <AvatarFallback>{suggestedAgent.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{suggestedAgent.name}</h3>
                        <p className="text-sm text-muted-foreground">{suggestedAgent.specialty}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-xs font-medium mb-1">Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {suggestedAgent.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Task Assignment Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>
                  <strong>Be specific</strong> in your task description to help the AI understand what you need.
                </li>
                <li>
                  <strong>List required skills</strong> to help match the task with the most suitable AI family member.
                </li>
                <li>
                  <strong>Set a realistic due date</strong> if the task has a deadline.
                </li>
                <li>
                  <strong>Use the "Find Best Agent" button</strong> to get AI recommendations based on skills.
                </li>
                <li>
                  <strong>Leave unassigned</strong> if you're not sure which agent to choose.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
