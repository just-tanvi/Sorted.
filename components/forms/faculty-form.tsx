"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Edit } from "lucide-react"
import { useTimetable, type Faculty } from "@/contexts/timetable-context"

const departments = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Economics",
  "Management",
]

export function FacultyForm() {
  const { faculty, subjects, addFaculty, updateFaculty, deleteFaculty } = useTimetable()
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    subjects: [] as string[],
    maxHoursPerWeek: "",
    averageLeavesPerMonth: "",
    unavailableSlots: [] as string[],
  })

  const timeSlots = [
    "Monday 09:00-10:00",
    "Monday 10:00-11:00",
    "Monday 11:00-12:00",
    "Tuesday 09:00-10:00",
    "Tuesday 10:00-11:00",
    "Tuesday 11:00-12:00",
    "Wednesday 09:00-10:00",
    "Wednesday 10:00-11:00",
    "Wednesday 11:00-12:00",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const facultyData = {
      name: formData.name,
      email: formData.email,
      department: formData.department,
      subjects: formData.subjects,
      maxHoursPerWeek: Number.parseInt(formData.maxHoursPerWeek),
      averageLeavesPerMonth: Number.parseInt(formData.averageLeavesPerMonth),
      unavailableSlots: formData.unavailableSlots,
    }

    if (isEditing) {
      updateFaculty(isEditing, facultyData)
      setIsEditing(null)
    } else {
      addFaculty(facultyData)
    }

    setFormData({
      name: "",
      email: "",
      department: "",
      subjects: [],
      maxHoursPerWeek: "",
      averageLeavesPerMonth: "",
      unavailableSlots: [],
    })
  }

  const handleEdit = (faculty: Faculty) => {
    setFormData({
      name: faculty.name,
      email: faculty.email,
      department: faculty.department,
      subjects: faculty.subjects,
      maxHoursPerWeek: faculty.maxHoursPerWeek.toString(),
      averageLeavesPerMonth: faculty.averageLeavesPerMonth.toString(),
      unavailableSlots: faculty.unavailableSlots,
    })
    setIsEditing(faculty.id)
  }

  const handleCancel = () => {
    setIsEditing(null)
    setFormData({
      name: "",
      email: "",
      department: "",
      subjects: [],
      maxHoursPerWeek: "",
      averageLeavesPerMonth: "",
      unavailableSlots: [],
    })
  }

  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      subjects: checked ? [...prev.subjects, subjectId] : prev.subjects.filter((id) => id !== subjectId),
    }))
  }

  const handleUnavailableSlotChange = (slot: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      unavailableSlots: checked ? [...prev.unavailableSlots, slot] : prev.unavailableSlots.filter((s) => s !== slot),
    }))
  }

  const departmentSubjects = subjects.filter((subject) => subject.department === formData.department)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Faculty" : "Add New Faculty"}</CardTitle>
          <CardDescription>Configure faculty details and teaching assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Faculty Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Dr. John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., john.smith@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value, subjects: [] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxHours">Max Hours/Week</Label>
                <Input
                  id="maxHours"
                  type="number"
                  placeholder="e.g., 20"
                  value={formData.maxHoursPerWeek}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maxHoursPerWeek: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaves">Avg Leaves/Month</Label>
                <Input
                  id="leaves"
                  type="number"
                  placeholder="e.g., 2"
                  value={formData.averageLeavesPerMonth}
                  onChange={(e) => setFormData((prev) => ({ ...prev, averageLeavesPerMonth: e.target.value }))}
                  required
                />
              </div>
            </div>

            {formData.department && departmentSubjects.length > 0 && (
              <div className="space-y-2">
                <Label>Subjects Can Teach</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {departmentSubjects.map((subject) => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject.id}
                        checked={formData.subjects.includes(subject.id)}
                        onCheckedChange={(checked) => handleSubjectChange(subject.id, checked as boolean)}
                      />
                      <Label htmlFor={subject.id} className="text-sm">
                        {subject.name} ({subject.code})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Unavailable Time Slots</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <div key={slot} className="flex items-center space-x-2">
                    <Checkbox
                      id={slot}
                      checked={formData.unavailableSlots.includes(slot)}
                      onCheckedChange={(checked) => handleUnavailableSlotChange(slot, checked as boolean)}
                    />
                    <Label htmlFor={slot} className="text-sm">
                      {slot}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">{isEditing ? "Update Faculty" : "Add Faculty"}</Button>
              {isEditing && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Faculty ({faculty.length})</CardTitle>
          <CardDescription>Manage your faculty members</CardDescription>
        </CardHeader>
        <CardContent>
          {faculty.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No faculty added yet</p>
          ) : (
            <div className="space-y-4">
              {faculty.map((facultyMember) => (
                <div key={facultyMember.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{facultyMember.name}</h4>
                      <Badge variant="secondary">{facultyMember.department}</Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground mb-2">
                      <span>Email: {facultyMember.email}</span>
                      <span>Max Hours: {facultyMember.maxHoursPerWeek}/week</span>
                      <span>Avg Leaves: {facultyMember.averageLeavesPerMonth}/month</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {facultyMember.subjects.map((subjectId) => {
                        const subject = subjects.find((s) => s.id === subjectId)
                        return subject ? (
                          <Badge key={subjectId} variant="outline" className="text-xs">
                            {subject.code}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(facultyMember)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteFaculty(facultyMember.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
