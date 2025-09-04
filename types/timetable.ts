export interface TimeSlot {
  day: string
  startTime: string
  endTime: string
  duration: number
}

export interface TimetableEntry {
  id: string
  batchId: string
  subjectId: string
  facultyId: string
  classroomId: string
  timeSlot: TimeSlot
  type: "theory" | "practical"
}

export interface GeneratedTimetable {
  id: string
  name: string
  entries: TimetableEntry[]
  conflicts: Conflict[]
  score: number
  generatedAt: Date
}

export interface Conflict {
  type: "faculty_clash" | "classroom_clash" | "batch_clash" | "capacity_exceeded"
  message: string
  entries: string[] // entry IDs involved in conflict
  severity: "high" | "medium" | "low"
}

export interface TimetableGenerationOptions {
  batchIds: string[]
  startDate: Date
  endDate: Date
  prioritizeFactors: {
    facultyWorkload: number
    classroomUtilization: number
    studentPreference: number
  }
}
