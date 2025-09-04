"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit } from "lucide-react"
import { useTimetable, type Subject } from "@/contexts/timetable-context"

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

export function SubjectForm() {
  const { subjects, addSubject, updateSubject, deleteSubject } = useTimetable()
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    credits: "",
    type: "theory" as const,
    hoursPerWeek: "",
    department: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const subjectData = {
      name: formData.name,
      code: formData.code,
      credits: Number.parseInt(formData.credits),
      type: formData.type,
      hoursPerWeek: Number.parseInt(formData.hoursPerWeek),
      department: formData.department,
    }

    if (isEditing) {
      updateSubject(isEditing, subjectData)
      setIsEditing(null)
    } else {
      addSubject(subjectData)
    }

    setFormData({ name: "", code: "", credits: "", type: "theory", hoursPerWeek: "", department: "" })
  }

  const handleEdit = (subject: Subject) => {
    setFormData({
      name: subject.name,
      code: subject.code,
      credits: subject.credits.toString(),
      type: subject.type,
      hoursPerWeek: subject.hoursPerWeek.toString(),
      department: subject.department,
    })
    setIsEditing(subject.id)
  }

  const handleCancel = () => {
    setIsEditing(null)
    setFormData({ name: "", code: "", credits: "", type: "theory", hoursPerWeek: "", department: "" })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Subject" : "Add New Subject"}</CardTitle>
          <CardDescription>Configure subject details and teaching requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Data Structures"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Subject Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., CS201"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  placeholder="e.g., 3"
                  value={formData.credits}
                  onChange={(e) => setFormData((prev) => ({ ...prev, credits: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Subject Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "theory" | "practical" | "both") =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theory">Theory</SelectItem>
                    <SelectItem value="practical">Practical</SelectItem>
                    <SelectItem value="both">Theory + Practical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hoursPerWeek">Hours per Week</Label>
                <Input
                  id="hoursPerWeek"
                  type="number"
                  placeholder="e.g., 4"
                  value={formData.hoursPerWeek}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hoursPerWeek: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
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

            <div className="flex gap-2">
              <Button type="submit">{isEditing ? "Update Subject" : "Add Subject"}</Button>
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
          <CardTitle>Existing Subjects ({subjects.length})</CardTitle>
          <CardDescription>Manage your subject catalog</CardDescription>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No subjects added yet</p>
          ) : (
            <div className="space-y-4">
              {subjects.map((subject) => (
                <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{subject.name}</h4>
                      <Badge variant="secondary">{subject.code}</Badge>
                      <Badge variant="outline" className="capitalize">
                        {subject.type}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Credits: {subject.credits}</span>
                      <span>Hours/Week: {subject.hoursPerWeek}</span>
                      <span>Department: {subject.department}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(subject)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteSubject(subject.id)}>
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
