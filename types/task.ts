export type TaskStatus = "pending" | "in-progress" | "completed" | "rejected"
export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigned_to?: string
  assignedTo?: string // For backward compatibility
  created_by?: string
  created_at?: string
  updated_at?: string
  due_date?: string
  completed_at?: string
  completed_by?: string
  approved_at?: string
  approved_by?: string
  rejected_at?: string
  rejected_by?: string
  rejection_reason?: string
  reassigned_at?: string
  reassigned_by?: string
  notes?: string
  attachments?: string[]
}
