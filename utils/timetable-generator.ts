import type {
  GeneratedTimetable,
  TimetableEntry,
  TimeSlot,
  Conflict,
  TimetableGenerationOptions,
} from "@/types/timetable"
import type { Classroom, Subject, Faculty, Batch, SchedulingParameters } from "@/contexts/timetable-context"

export class TimetableGenerator {
  private classrooms: Classroom[]
  private subjects: Subject[]
  private faculty: Faculty[]
  private batches: Batch[]
  private parameters: SchedulingParameters

  constructor(
    classrooms: Classroom[],
    subjects: Subject[],
    faculty: Faculty[],
    batches: Batch[],
    parameters: SchedulingParameters,
  ) {
    this.classrooms = classrooms
    this.subjects = subjects
    this.faculty = faculty
    this.batches = batches
    this.parameters = parameters
  }

  generateTimeSlots(): TimeSlot[] {
    const slots: TimeSlot[] = []
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    const workingDays = days.slice(0, this.parameters.workingDaysPerWeek)

    const startHour = Number.parseInt(this.parameters.classStartTime.split(":")[0])
    const startMinute = Number.parseInt(this.parameters.classStartTime.split(":")[1])
    const endHour = Number.parseInt(this.parameters.classEndTime.split(":")[0])
    const endMinute = Number.parseInt(this.parameters.classEndTime.split(":")[1])

    const totalMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute)
    const slotDuration = this.parameters.classDuration + this.parameters.breakDuration
    const slotsPerDay = Math.floor(totalMinutes / slotDuration)

    for (const day of workingDays) {
      for (let i = 0; i < Math.min(slotsPerDay, this.parameters.maxClassesPerDay); i++) {
        const slotStartMinutes = startHour * 60 + startMinute + i * slotDuration
        const slotEndMinutes = slotStartMinutes + this.parameters.classDuration

        const startTime = `${Math.floor(slotStartMinutes / 60)
          .toString()
          .padStart(2, "0")}:${(slotStartMinutes % 60).toString().padStart(2, "0")}`
        const endTime = `${Math.floor(slotEndMinutes / 60)
          .toString()
          .padStart(2, "0")}:${(slotEndMinutes % 60).toString().padStart(2, "0")}`

        slots.push({
          day,
          startTime,
          endTime,
          duration: this.parameters.classDuration,
        })
      }
    }

    return slots
  }

  generateTimetables(options: TimetableGenerationOptions): GeneratedTimetable[] {
    const timeSlots = this.generateTimeSlots()
    const timetables: GeneratedTimetable[] = []

    // Generate 3 different timetable options with different strategies
    for (let i = 0; i < 3; i++) {
      const timetable = this.generateSingleTimetable(timeSlots, options, i)
      timetables.push(timetable)
    }

    return timetables.sort((a, b) => b.score - a.score)
  }

  private generateSingleTimetable(
    timeSlots: TimeSlot[],
    options: TimetableGenerationOptions,
    strategy: number,
  ): GeneratedTimetable {
    const entries: TimetableEntry[] = []
    const conflicts: Conflict[] = []

    // Get batches to schedule
    const batchesToSchedule = this.batches.filter((batch) => options.batchIds.includes(batch.id))

    // Create requirements for each batch-subject combination
    const requirements = this.createSchedulingRequirements(batchesToSchedule)

    // Sort requirements based on strategy
    const sortedRequirements = this.sortRequirementsByStrategy(requirements, strategy)

    // Schedule each requirement
    for (const requirement of sortedRequirements) {
      const scheduled = this.scheduleRequirement(requirement, timeSlots, entries)
      if (scheduled) {
        entries.push(scheduled)
      } else {
        conflicts.push({
          type: "classroom_clash",
          message: `Could not schedule ${requirement.subject.name} for ${requirement.batch.name}`,
          entries: [],
          severity: "high",
        })
      }
    }

    // Detect conflicts
    const detectedConflicts = this.detectConflicts(entries)
    conflicts.push(...detectedConflicts)

    // Calculate score
    const score = this.calculateTimetableScore(entries, conflicts)

    return {
      id: `timetable-${Date.now()}-${strategy}`,
      name: `Timetable Option ${strategy + 1}`,
      entries,
      conflicts,
      score,
      generatedAt: new Date(),
    }
  }

  private createSchedulingRequirements(batches: Batch[]) {
    const requirements: Array<{
      batch: Batch
      subject: Subject
      faculty: Faculty
      hoursNeeded: number
    }> = []

    for (const batch of batches) {
      for (const subjectId of batch.subjects) {
        const subject = this.subjects.find((s) => s.id === subjectId)
        if (!subject) continue

        const availableFaculty = this.faculty.filter(
          (f) => f.subjects.includes(subjectId) && f.department === batch.department,
        )

        if (availableFaculty.length === 0) continue

        // Choose faculty with least workload
        const faculty = availableFaculty.reduce((prev, curr) =>
          prev.maxHoursPerWeek > curr.maxHoursPerWeek ? curr : prev,
        )

        requirements.push({
          batch,
          subject,
          faculty,
          hoursNeeded: subject.hoursPerWeek,
        })
      }
    }

    return requirements
  }

  private sortRequirementsByStrategy(requirements: any[], strategy: number) {
    switch (strategy) {
      case 0: // Priority to high-hour subjects
        return requirements.sort((a, b) => b.hoursNeeded - a.hoursNeeded)
      case 1: // Priority to large batches
        return requirements.sort((a, b) => b.batch.strength - a.batch.strength)
      case 2: // Random distribution
        return requirements.sort(() => Math.random() - 0.5)
      default:
        return requirements
    }
  }

  private scheduleRequirement(
    requirement: any,
    timeSlots: TimeSlot[],
    existingEntries: TimetableEntry[],
  ): TimetableEntry | null {
    const { batch, subject, faculty } = requirement

    // Find suitable classroom
    const suitableClassrooms = this.classrooms.filter((classroom) => {
      if (classroom.capacity < batch.strength) return false
      if (subject.type === "practical" && classroom.type !== "lab") return false
      return true
    })

    if (suitableClassrooms.length === 0) return null

    // Try to find available time slot
    for (const timeSlot of timeSlots) {
      // Check if faculty is available
      if (this.isFacultyBusy(faculty.id, timeSlot, existingEntries)) continue

      // Check if batch is busy
      if (this.isBatchBusy(batch.id, timeSlot, existingEntries)) continue

      // Find available classroom
      const availableClassroom = suitableClassrooms.find(
        (classroom) => !this.isClassroomBusy(classroom.id, timeSlot, existingEntries),
      )

      if (availableClassroom) {
        return {
          id: `entry-${Date.now()}-${Math.random()}`,
          batchId: batch.id,
          subjectId: subject.id,
          facultyId: faculty.id,
          classroomId: availableClassroom.id,
          timeSlot,
          type: subject.type === "practical" ? "practical" : "theory",
        }
      }
    }

    return null
  }

  private isFacultyBusy(facultyId: string, timeSlot: TimeSlot, entries: TimetableEntry[]): boolean {
    return entries.some(
      (entry) =>
        entry.facultyId === facultyId &&
        entry.timeSlot.day === timeSlot.day &&
        this.timeSlotsOverlap(entry.timeSlot, timeSlot),
    )
  }

  private isBatchBusy(batchId: string, timeSlot: TimeSlot, entries: TimetableEntry[]): boolean {
    return entries.some(
      (entry) =>
        entry.batchId === batchId &&
        entry.timeSlot.day === timeSlot.day &&
        this.timeSlotsOverlap(entry.timeSlot, timeSlot),
    )
  }

  private isClassroomBusy(classroomId: string, timeSlot: TimeSlot, entries: TimetableEntry[]): boolean {
    return entries.some(
      (entry) =>
        entry.classroomId === classroomId &&
        entry.timeSlot.day === timeSlot.day &&
        this.timeSlotsOverlap(entry.timeSlot, timeSlot),
    )
  }

  private timeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
    const start1 = this.timeToMinutes(slot1.startTime)
    const end1 = this.timeToMinutes(slot1.endTime)
    const start2 = this.timeToMinutes(slot2.startTime)
    const end2 = this.timeToMinutes(slot2.endTime)

    return start1 < end2 && start2 < end1
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  private detectConflicts(entries: TimetableEntry[]): Conflict[] {
    const conflicts: Conflict[] = []

    // Check for faculty conflicts
    const facultySlots = new Map<string, TimetableEntry[]>()
    entries.forEach((entry) => {
      const key = `${entry.facultyId}-${entry.timeSlot.day}-${entry.timeSlot.startTime}`
      if (!facultySlots.has(key)) {
        facultySlots.set(key, [])
      }
      facultySlots.get(key)!.push(entry)
    })

    facultySlots.forEach((entries, key) => {
      if (entries.length > 1) {
        conflicts.push({
          type: "faculty_clash",
          message: `Faculty has multiple classes at the same time`,
          entries: entries.map((e) => e.id),
          severity: "high",
        })
      }
    })

    return conflicts
  }

  private calculateTimetableScore(entries: TimetableEntry[], conflicts: Conflict[]): number {
    let score = 100

    // Deduct points for conflicts
    conflicts.forEach((conflict) => {
      switch (conflict.severity) {
        case "high":
          score -= 20
          break
        case "medium":
          score -= 10
          break
        case "low":
          score -= 5
          break
      }
    })

    // Add points for good distribution
    const dailyDistribution = this.calculateDailyDistribution(entries)
    const distributionScore = this.calculateDistributionScore(dailyDistribution)
    score += distributionScore

    return Math.max(0, score)
  }

  private calculateDailyDistribution(entries: TimetableEntry[]): Record<string, number> {
    const distribution: Record<string, number> = {}
    entries.forEach((entry) => {
      distribution[entry.timeSlot.day] = (distribution[entry.timeSlot.day] || 0) + 1
    })
    return distribution
  }

  private calculateDistributionScore(distribution: Record<string, number>): number {
    const values = Object.values(distribution)
    if (values.length === 0) return 0

    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length

    // Lower variance = better distribution = higher score
    return Math.max(0, 20 - variance)
  }
}
