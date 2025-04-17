import { CardContent } from "@/components/ui/card"
import { CardDescription } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TaskflowTrigger {
  trigger: string
  description: string
  aiFamilyMember: string
}

const taskflowTriggers: TaskflowTrigger[] = [
  {
    trigger: "Create task: [Task Title]",
    description: "Creates a new task with the specified title.",
    aiFamilyMember: "Sophia",
  },
  {
    trigger: "Assign task to [AI Family Member]: [Task Title]",
    description: "Assigns the specified task to the mentioned AI Family member.",
    aiFamilyMember: "Sophia",
  },
  {
    trigger: "Set deadline for [Task Title]: [Date]",
    description: "Sets a deadline for the specified task.",
    aiFamilyMember: "Sophia",
  },
  {
    trigger: "Show tasks for [AI Family Member]",
    description: "Displays all tasks assigned to the specified AI Family member.",
    aiFamilyMember: "Sophia",
  },
  {
    trigger: "Create workflow for [Workflow Name]",
    description: "Creates a new workflow with the specified name.",
    aiFamilyMember: "Sophia",
  },
  {
    trigger: "Analyze this document",
    description: "Processes and analyzes the attached document.",
    aiFamilyMember: "Lyra",
  },
  {
    trigger: "Summarize this PDF",
    description: "Creates a summary of the attached PDF.",
    aiFamilyMember: "Lyra",
  },
  {
    trigger: "Extract data from this spreadsheet",
    description: "Extracts structured data from the attached spreadsheet.",
    aiFamilyMember: "Karl",
  },
  {
    trigger: "What's in this image?",
    description: "Analyzes and describes the content of an image.",
    aiFamilyMember: "Kara",
  },
]

export function TaskflowCheatsheet() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Taskflow Triggers Cheatsheet</CardTitle>
        <CardDescription>Use these triggers to manage tasks and workflows with AI Family members.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-auto">
        <Table>
          <TableCaption>A list of available taskflow triggers and their descriptions.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Trigger</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>AI Family Member</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taskflowTriggers.map((trigger) => (
              <TableRow key={trigger.trigger}>
                <TableCell className="font-medium">{trigger.trigger}</TableCell>
                <TableCell>{trigger.description}</TableCell>
                <TableCell>{trigger.aiFamilyMember}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
