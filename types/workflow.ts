export interface WorkflowStatus {
  status: "draft" | "pending_review" | "approved" | "rejected" | "revision_requested"
  submittedAt?: Date
  reviewedAt?: Date
  approvedBy?: string
  rejectedBy?: string
  comments: WorkflowComment[]
}

export interface WorkflowComment {
  id: string
  userId: string
  userName: string
  userRole: string
  message: string
  timestamp: Date
  type: "comment" | "approval" | "rejection" | "revision_request"
}

export interface TimetableWithWorkflow {
  id: string
  name: string
  entries: any[]
  conflicts: any[]
  score: number
  generatedAt: Date
  workflow: WorkflowStatus
  createdBy: string
  department?: string
}
