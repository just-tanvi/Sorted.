"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTimetable } from "@/contexts/timetable-context"
import { useWorkflow } from "@/contexts/workflow-context"
import { useAuth } from "@/contexts/auth-context"
import { TimetableGenerator } from "@/utils/timetable-generator"
import type { GeneratedTimetable, TimetableGenerationOptions } from "@/types/timetable"
import { Calendar, Clock, AlertTriangle, CheckCircle, Loader2, Send } from "lucide-react"

export function TimetableGeneration() {
  const { classrooms, subjects, faculty, batches, schedulingParameters } = useTimetable()
  const { submitForReview } = useWorkflow()
  const { user } = useAuth()
  const [selectedBatches, setSelectedBatches] = useState<string[]>([])
  const [generatedTimetables, setGeneratedTimetables] = useState<GeneratedTimetable[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTimetable, setSelectedTimetable] = useState<string | null>(null)

  const handleBatchSelection = (batchId: string, checked: boolean) => {
    setSelectedBatches((prev) => (checked ? [...prev, batchId] : prev.filter((id) => id !== batchId)))
  }

  const generateTimetables = async () => {
    if (selectedBatches.length === 0) {
      alert("Please select at least one batch")
      return
    }

    setIsGenerating(true)

    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const generator = new TimetableGenerator(classrooms, subjects, faculty, batches, schedulingParameters)

    const options: TimetableGenerationOptions = {
      batchIds: selectedBatches,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      prioritizeFactors: {
        facultyWorkload: 0.4,
        classroomUtilization: 0.3,
        studentPreference: 0.3,
      },
    }

    const timetables = generator.generateTimetables(options)
    setGeneratedTimetables(timetables)
    setSelectedTimetable(timetables[0]?.id || null)
    setIsGenerating(false)
  }

  const handleSubmitForReview = (timetable: GeneratedTimetable) => {
    if (!user) return

    submitForReview(timetable, user.name)
    alert("Timetable submitted for review successfully!")
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

  const selectedTimetableData = generatedTimetables.find((t) => t.id === selectedTimetable)

  const renderTimetableGrid = (timetable: GeneratedTimetable) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    const timeSlots = Array.from(new Set(timetable.entries.map((entry) => entry.timeSlot.startTime))).sort()

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border">
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
                <td className="border border-border p-2 bg-muted/50 font-medium text-sm">{timeSlot}</td>
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-balance">Timetable Generation</h2>
        <p className="text-muted-foreground text-pretty">
          Generate optimized timetables based on your configured parameters
        </p>
      </div>

      {/* Batch Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Batches</CardTitle>
          <CardDescription>Choose which batches to include in the timetable generation</CardDescription>
        </CardHeader>
        <CardContent>
          {batches.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No batches configured. Please add batches in the Parameters section first.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batches.map((batch) => (
                <div key={batch.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={batch.id}
                    checked={selectedBatches.includes(batch.id)}
                    onCheckedChange={(checked) => handleBatchSelection(batch.id, checked as boolean)}
                  />
                  <Label htmlFor={batch.id} className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{batch.name}</span>
                      <Badge variant="secondary">{batch.department}</Badge>
                      <span className="text-sm text-muted-foreground">({batch.strength} students)</span>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Timetables</CardTitle>
          <CardDescription>Create multiple optimized timetable options</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={generateTimetables}
            disabled={isGenerating || selectedBatches.length === 0}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Timetables...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Generate Timetables
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Timetables */}
      {generatedTimetables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Timetables</CardTitle>
            <CardDescription>Choose from multiple optimized options</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTimetable || ""} onValueChange={setSelectedTimetable}>
              <TabsList className="grid w-full grid-cols-3">
                {generatedTimetables.map((timetable, index) => (
                  <TabsTrigger key={timetable.id} value={timetable.id}>
                    <div className="flex items-center gap-2">
                      <span>Option {index + 1}</span>
                      <Badge variant={timetable.conflicts.length === 0 ? "default" : "destructive"}>
                        Score: {timetable.score}
                      </Badge>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {generatedTimetables.map((timetable) => (
                <TabsContent key={timetable.id} value={timetable.id} className="space-y-4">
                  {/* Timetable Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-2xl font-bold">{timetable.entries.length}</div>
                            <div className="text-sm text-muted-foreground">Total Classes</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-2xl font-bold">{timetable.conflicts.length}</div>
                            <div className="text-sm text-muted-foreground">Conflicts</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-2xl font-bold">{timetable.score}</div>
                            <div className="text-sm text-muted-foreground">Quality Score</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-bold">{timetable.generatedAt.toLocaleTimeString()}</div>
                            <div className="text-sm text-muted-foreground">Generated</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Conflicts */}
                  {timetable.conflicts.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <div className="font-medium">Conflicts detected:</div>
                          {timetable.conflicts.map((conflict, index) => (
                            <div key={index} className="text-sm">
                              • {conflict.message}
                            </div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Timetable Grid */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Timetable View</h4>
                    {renderTimetableGrid(timetable)}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button onClick={() => handleSubmitForReview(timetable)}>
                      <Send className="mr-2 h-4 w-4" />
                      Submit for Review
                    </Button>
                    <Button variant="outline">Export to PDF</Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
