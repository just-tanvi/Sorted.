"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export interface Classroom {
  id: string
  name: string
  capacity: number
  type: "lecture" | "lab" | "seminar"
  equipment: string[]
}

export interface Subject {
  id: string
  name: string
  code: string
  credits: number
  type: "theory" | "practical" | "both"
  hoursPerWeek: number
  department: string
}

export interface Faculty {
  id: string
  name: string
  email: string
  department: string
  subjects: string[] // subject IDs
  maxHoursPerWeek: number
  averageLeavesPerMonth: number
  unavailableSlots: string[] // time slots they're not available
}

export interface Batch {
  id: string
  name: string
  department: string
  semester: number
  strength: number
  subjects: string[] // subject IDs
}

export interface SchedulingParameters {
  maxClassesPerDay: number
  workingDaysPerWeek: number
  classStartTime: string
  classEndTime: string
  classDuration: number // in minutes
  breakDuration: number // in minutes
}

export interface SpecialClass {
  id: string
  name: string
  fixedDay: string
  fixedTime: string
  duration: number
  classroom: string
  faculty: string
  batch: string
}

interface TimetableContextType {
  classrooms: Classroom[]
  subjects: Subject[]
  faculty: Faculty[]
  batches: Batch[]
  schedulingParameters: SchedulingParameters
  specialClasses: SpecialClass[]

  // Actions
  addClassroom: (classroom: Omit<Classroom, "id">) => void
  updateClassroom: (id: string, classroom: Partial<Classroom>) => void
  deleteClassroom: (id: string) => void

  addSubject: (subject: Omit<Subject, "id">) => void
  updateSubject: (id: string, subject: Partial<Subject>) => void
  deleteSubject: (id: string) => void

  addFaculty: (faculty: Omit<Faculty, "id">) => void
  updateFaculty: (id: string, faculty: Partial<Faculty>) => void
  deleteFaculty: (id: string) => void

  addBatch: (batch: Omit<Batch, "id">) => void
  updateBatch: (id: string, batch: Partial<Batch>) => void
  deleteBatch: (id: string) => void

  updateSchedulingParameters: (params: Partial<SchedulingParameters>) => void

  addSpecialClass: (specialClass: Omit<SpecialClass, "id">) => void
  updateSpecialClass: (id: string, specialClass: Partial<SpecialClass>) => void
  deleteSpecialClass: (id: string) => void
}

const TimetableContext = createContext<TimetableContextType | undefined>(undefined)

const defaultSchedulingParameters: SchedulingParameters = {
  maxClassesPerDay: 8,
  workingDaysPerWeek: 5,
  classStartTime: "09:00",
  classEndTime: "17:00",
  classDuration: 60,
  breakDuration: 15,
}

export function TimetableProvider({ children }: { children: React.ReactNode }) {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [schedulingParameters, setSchedulingParameters] = useState<SchedulingParameters>(defaultSchedulingParameters)
  const [specialClasses, setSpecialClasses] = useState<SpecialClass[]>([])

  // Classroom actions
  const addClassroom = (classroom: Omit<Classroom, "id">) => {
    const newClassroom = { ...classroom, id: Date.now().toString() }
    setClassrooms((prev) => [...prev, newClassroom])
  }

  const updateClassroom = (id: string, classroom: Partial<Classroom>) => {
    setClassrooms((prev) => prev.map((c) => (c.id === id ? { ...c, ...classroom } : c)))
  }

  const deleteClassroom = (id: string) => {
    setClassrooms((prev) => prev.filter((c) => c.id !== id))
  }

  // Subject actions
  const addSubject = (subject: Omit<Subject, "id">) => {
    const newSubject = { ...subject, id: Date.now().toString() }
    setSubjects((prev) => [...prev, newSubject])
  }

  const updateSubject = (id: string, subject: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...subject } : s)))
  }

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id))
  }

  // Faculty actions
  const addFaculty = (faculty: Omit<Faculty, "id">) => {
    const newFaculty = { ...faculty, id: Date.now().toString() }
    setFaculty((prev) => [...prev, newFaculty])
  }

  const updateFaculty = (id: string, faculty: Partial<Faculty>) => {
    setFaculty((prev) => prev.map((f) => (f.id === id ? { ...f, ...faculty } : f)))
  }

  const deleteFaculty = (id: string) => {
    setFaculty((prev) => prev.filter((f) => f.id !== id))
  }

  // Batch actions
  const addBatch = (batch: Omit<Batch, "id">) => {
    const newBatch = { ...batch, id: Date.now().toString() }
    setBatches((prev) => [...prev, newBatch])
  }

  const updateBatch = (id: string, batch: Partial<Batch>) => {
    setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, ...batch } : b)))
  }

  const deleteBatch = (id: string) => {
    setBatches((prev) => prev.filter((b) => b.id !== id))
  }

  // Scheduling parameters
  const updateSchedulingParameters = (params: Partial<SchedulingParameters>) => {
    setSchedulingParameters((prev) => ({ ...prev, ...params }))
  }

  // Special classes
  const addSpecialClass = (specialClass: Omit<SpecialClass, "id">) => {
    const newSpecialClass = { ...specialClass, id: Date.now().toString() }
    setSpecialClasses((prev) => [...prev, newSpecialClass])
  }

  const updateSpecialClass = (id: string, specialClass: Partial<SpecialClass>) => {
    setSpecialClasses((prev) => prev.map((sc) => (sc.id === id ? { ...sc, ...specialClass } : sc)))
  }

  const deleteSpecialClass = (id: string) => {
    setSpecialClasses((prev) => prev.filter((sc) => sc.id !== id))
  }

  return (
    <TimetableContext.Provider
      value={{
        classrooms,
        subjects,
        faculty,
        batches,
        schedulingParameters,
        specialClasses,
        addClassroom,
        updateClassroom,
        deleteClassroom,
        addSubject,
        updateSubject,
        deleteSubject,
        addFaculty,
        updateFaculty,
        deleteFaculty,
        addBatch,
        updateBatch,
        deleteBatch,
        updateSchedulingParameters,
        addSpecialClass,
        updateSpecialClass,
        deleteSpecialClass,
      }}
    >
      {children}
    </TimetableContext.Provider>
  )
}

export function useTimetable() {
  const context = useContext(TimetableContext)
  if (context === undefined) {
    throw new Error("useTimetable must be used within a TimetableProvider")
  }
  return context
}
