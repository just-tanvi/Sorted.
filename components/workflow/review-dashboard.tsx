"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWorkflow } from "@/contexts/workflow-context"
import { useAuth } from "@/contexts/auth-context"
import { Clock, CheckCircle, XCircle, AlertCircle, MessageSquare } from "lucide-react"
import { TimetableReviewModal } from "./timetable-review-modal"
import type { TimetableWithWorkflow } from "@/types/workflow"

export function ReviewDashboard() {
  const { timetables, getTimetablesByStatus } = useWorkflow()
  const { user } = useAuth()
  const [selectedTimetable, setSelectedTimetable] = useState<TimetableWithWorkflow | null>(null)

  const pendingTimetables = getTimetablesByStatus("pending_review")
  const approvedTimetables = getTimetablesByStatus("approved")
  const rejectedTimetables = getTimetablesByStatus("rejected")
  const revisionTimetables = getTimetablesByStatus("revision_requested")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending_review":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "revision_requested":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_review":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "revision_requested":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const canReview = user?.role === "admin" || user?.role === "coordinator"

  const renderTimetableCard = (timetable: TimetableWithWorkflow) => (
    <Card key={timetable.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{timetable.name}</CardTitle>
          <div className="flex items-center gap-2">
            {getStatusIcon(timetable.workflow.status)}
            <Badge className={getStatusColor(timetable.workflow.status)}>
              {timetable.workflow.status.replace("_", " ")}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Created by {timetable.createdBy} • Score: {timetable.score} • {timetable.entries.length} classes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Submitted: {timetable.workflow.submittedAt?.toLocaleDateString()}</span>
            {timetable.workflow.reviewedAt && (
              <span>Reviewed: {timetable.workflow.reviewedAt.toLocaleDateString()}</span>
            )}
          </div>

          {timetable.conflicts.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{timetable.conflicts.length} conflicts detected</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{timetable.workflow.comments.length} comments</span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedTimetable(timetable)}>
              View Details
            </Button>
            {canReview && timetable.workflow.status === "pending_review" && (
              <Button size="sm" onClick={() => setSelectedTimetable(timetable)}>
                Review
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-balance">Review & Approval</h2>
        <p className="text-muted-foreground text-pretty">Manage timetable review and approval workflow</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{pendingTimetables.length}</div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{approvedTimetables.length}</div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{rejectedTimetables.length}</div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{revisionTimetables.length}</div>
                <div className="text-sm text-muted-foreground">Needs Revision</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timetables by Status */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Review ({pendingTimetables.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedTimetables.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedTimetables.length})</TabsTrigger>
          <TabsTrigger value="revision">Needs Revision ({revisionTimetables.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingTimetables.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">No timetables pending review</CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{pendingTimetables.map(renderTimetableCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedTimetables.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">No approved timetables</CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{approvedTimetables.map(renderTimetableCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedTimetables.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">No rejected timetables</CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{rejectedTimetables.map(renderTimetableCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="revision" className="space-y-4">
          {revisionTimetables.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">No timetables need revision</CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{revisionTimetables.map(renderTimetableCard)}</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      {selectedTimetable && (
        <TimetableReviewModal
          timetable={selectedTimetable}
          onClose={() => setSelectedTimetable(null)}
          canReview={canReview}
        />
      )}
    </div>
  )
}
