"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { TimetableWithWorkflow, WorkflowComment } from "@/types/workflow"
import type { GeneratedTimetable } from "@/types/timetable"

interface WorkflowContextType {
  timetables: TimetableWithWorkflow[]
  submitForReview: (timetable: GeneratedTimetable, createdBy: string) => void
  approveTimetable: (timetableId: string, approvedBy: string, comment?: string) => void
  rejectTimetable: (timetableId: string, rejectedBy: string, comment: string) => void
  requestRevision: (timetableId: string, requestedBy: string, comment: string) => void
  addComment: (timetableId: string, comment: Omit<WorkflowComment, "id" | "timestamp">) => void
  getTimetablesByStatus: (status: string) => TimetableWithWorkflow[]
  getTimetablesByDepartment: (department: string) => TimetableWithWorkflow[]
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [timetables, setTimetables] = useState<TimetableWithWorkflow[]>([])

  const submitForReview = (timetable: GeneratedTimetable, createdBy: string) => {
    const timetableWithWorkflow: TimetableWithWorkflow = {
      ...timetable,
      workflow: {
        status: "pending_review",
        submittedAt: new Date(),
        comments: [],
      },
      createdBy,
    }

    setTimetables((prev) => [...prev, timetableWithWorkflow])
  }

  const approveTimetable = (timetableId: string, approvedBy: string, comment?: string) => {
    setTimetables((prev) =>
      prev.map((timetable) => {
        if (timetable.id === timetableId) {
          const updatedComments = [...timetable.workflow.comments]

          if (comment) {
            updatedComments.push({
              id: Date.now().toString(),
              userId: approvedBy,
              userName: "Admin User", // In real app, get from user context
              userRole: "admin",
              message: comment,
              timestamp: new Date(),
              type: "approval",
            })
          }

          return {
            ...timetable,
            workflow: {
              ...timetable.workflow,
              status: "approved" as const,
              reviewedAt: new Date(),
              approvedBy,
              comments: updatedComments,
            },
          }
        }
        return timetable
      }),
    )
  }

  const rejectTimetable = (timetableId: string, rejectedBy: string, comment: string) => {
    setTimetables((prev) =>
      prev.map((timetable) => {
        if (timetable.id === timetableId) {
          const updatedComments = [
            ...timetable.workflow.comments,
            {
              id: Date.now().toString(),
              userId: rejectedBy,
              userName: "Admin User", // In real app, get from user context
              userRole: "admin",
              message: comment,
              timestamp: new Date(),
              type: "rejection" as const,
            },
          ]

          return {
            ...timetable,
            workflow: {
              ...timetable.workflow,
              status: "rejected" as const,
              reviewedAt: new Date(),
              rejectedBy,
              comments: updatedComments,
            },
          }
        }
        return timetable
      }),
    )
  }

  const requestRevision = (timetableId: string, requestedBy: string, comment: string) => {
    setTimetables((prev) =>
      prev.map((timetable) => {
        if (timetable.id === timetableId) {
          const updatedComments = [
            ...timetable.workflow.comments,
            {
              id: Date.now().toString(),
              userId: requestedBy,
              userName: "Admin User", // In real app, get from user context
              userRole: "admin",
              message: comment,
              timestamp: new Date(),
              type: "revision_request" as const,
            },
          ]

          return {
            ...timetable,
            workflow: {
              ...timetable.workflow,
              status: "revision_requested" as const,
              reviewedAt: new Date(),
              comments: updatedComments,
            },
          }
        }
        return timetable
      }),
    )
  }

  const addComment = (timetableId: string, comment: Omit<WorkflowComment, "id" | "timestamp">) => {
    setTimetables((prev) =>
      prev.map((timetable) => {
        if (timetable.id === timetableId) {
          const newComment: WorkflowComment = {
            ...comment,
            id: Date.now().toString(),
            timestamp: new Date(),
          }

          return {
            ...timetable,
            workflow: {
              ...timetable.workflow,
              comments: [...timetable.workflow.comments, newComment],
            },
          }
        }
        return timetable
      }),
    )
  }

  const getTimetablesByStatus = (status: string) => {
    return timetables.filter((t) => t.workflow.status === status)
  }

  const getTimetablesByDepartment = (department: string) => {
    return timetables.filter((t) => t.department === department)
  }

  return (
    <WorkflowContext.Provider
      value={{
        timetables,
        submitForReview,
        approveTimetable,
        rejectTimetable,
        requestRevision,
        addComment,
        getTimetablesByStatus,
        getTimetablesByDepartment,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider")
  }
  return context
}
