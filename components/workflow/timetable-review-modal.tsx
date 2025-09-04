"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWorkflow } from "@/contexts/workflow-context"
import { useAuth } from "@/contexts/auth-context"
import { useTimetable } from "@/contexts/timetable-context"
import type { TimetableWithWorkflow } from "@/types/workflow"
import { CheckCircle, XCircle, AlertCircle, MessageSquare, Calendar, Clock } from "lucide-react"

interface TimetableReviewModalProps {
  timetable: TimetableWithWorkflow
  onClose: () => void
  canReview: boolean
}

export function TimetableReviewModal({ timetable, onClose, canReview }: TimetableReviewModalProps) {
  const { approveTimetable, rejectTimetable, requestRevision, addComment } = useWorkflow()
  const { subjects, faculty, classrooms, batches } = useTimetable()
  const { user } = useAuth()
  const [comment, setComment] = useState("")
  const [action, setAction] = useState<"approve" | "reject" | "revision" | "comment" | null>(null)

  const handleAction = () => {
    if (!user || !action) return

    switch (action) {
      case "approve":
        approveTimetable(timetable.id, user.id, comment || undefined)
        break
      case "reject":
        if (comment.trim()) {
          rejectTimetable(timetable.id, user.id, comment)
        }
        break
      case "revision":
        if (comment.trim()) {
          requestRevision(timetable.id, user.id, comment)
        }
        break
      case "comment":
        if (comment.trim()) {
          addComment(timetable.id, {
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            message: comment,
            type: "comment",
          })
        }
        break
    }

    setComment("")
    setAction(null)
    onClose()
  }

  const getSubjectName = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.name || "Unknown Subject"
  }

  const getFacultyName = (facultyId: string) => {
    return faculty.find((f) => f.id === facultyId)?.name || "Unknown Faculty"
  }

  const getClassroomName = (classroomId: string) => {
    return classrooms.find((c) => c.id === classroomId)?.name || "Unknown Classroom"
  }

  const getBatchName = (batchId: string) => {
    return batches.find((b) => b.id === batchId)?.name || "Unknown Batch"
  }

  const renderTimetableGrid = () => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    const timeSlots = Array.from(new Set(timetable.entries.map((entry) => entry.timeSlot.startTime))).sort()

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border text-sm">
          <thead>
            <tr>
              <th className="border border-border p-2 bg-muted font-medium">Time</th>
              {days.map((day) => (
                <th key={day} className="border border-border p-2 bg-muted font-medium">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((timeSlot) => (
              <tr key={timeSlot}>
                <td className="border border-border p-2 bg-muted/50 font-medium">{timeSlot}</td>
                {days.map((day) => {
                  const entry = timetable.entries.find(
                    (e) => e.timeSlot.day === day && e.timeSlot.startTime === timeSlot,
                  )

                  return (
                    <td key={`${day}-${timeSlot}`} className="border border-border p-1">
                      {entry ? (
                        <div className="bg-secondary/10 p-2 rounded text-xs space-y-1">
                          <div className="font-medium text-secondary">{getSubjectName(entry.subjectId)}</div>
                          <div className="text-muted-foreground">{getFacultyName(entry.facultyId)}</div>
                          <div className="text-muted-foreground">{getClassroomName(entry.classroomId)}</div>
                          <div className="text-muted-foreground">{getBatchName(entry.batchId)}</div>
                        </div>
                      ) : (
                        <div className="h-16"></div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {timetable.name}
          </DialogTitle>
          <DialogDescription>Review timetable details and provide feedback</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Timetable Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-lg font-bold">{timetable.score}</div>
                    <div className="text-sm text-muted-foreground">Quality Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-lg font-bold">{timetable.entries.length}</div>
                    <div className="text-sm text-muted-foreground">Total Classes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-lg font-bold">{timetable.conflicts.length}</div>
                    <div className="text-sm text-muted-foreground">Conflicts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conflicts */}
          {timetable.conflicts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Conflicts Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {timetable.conflicts.map((conflict, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-destructive/10 rounded">
                      <Badge variant="destructive">{conflict.severity}</Badge>
                      <span className="text-sm">{conflict.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timetable Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Timetable View</CardTitle>
            </CardHeader>
            <CardContent>{renderTimetableGrid()}</CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments & Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timetable.workflow.comments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No comments yet</p>
              ) : (
                <div className="space-y-4">
                  {timetable.workflow.comments.map((comment) => (
                    <div key={comment.id} className="border-l-4 border-secondary pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{comment.userName}</span>
                        <Badge variant="outline">{comment.userRole}</Badge>
                        <Badge
                          variant={
                            comment.type === "approval"
                              ? "default"
                              : comment.type === "rejection"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {comment.type.replace("_", " ")}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{comment.timestamp.toLocaleString()}</span>
                      </div>
                      <p className="text-sm">{comment.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Actions */}
          {canReview && (
            <Card>
              <CardHeader>
                <CardTitle>Review Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Add your comment or feedback..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />

                <div className="flex gap-2 flex-wrap">
                  {timetable.workflow.status === "pending_review" && (
                    <>
                      <Button
                        onClick={() => setAction("approve")}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={!action && !comment.trim()}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button onClick={() => setAction("reject")} variant="destructive" disabled={!comment.trim()}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button onClick={() => setAction("revision")} variant="outline" disabled={!comment.trim()}>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Request Revision
                      </Button>
                    </>
                  )}
                  <Button onClick={() => setAction("comment")} variant="outline" disabled={!comment.trim()}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Add Comment
                  </Button>
                </div>

                {action && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button onClick={handleAction}>
                      Confirm{" "}
                      {action === "approve"
                        ? "Approval"
                        : action === "reject"
                          ? "Rejection"
                          : action === "revision"
                            ? "Revision Request"
                            : "Comment"}
                    </Button>
                    <Button variant="outline" onClick={() => setAction(null)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
