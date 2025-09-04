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
import { useTimetable, type Batch } from "@/contexts/timetable-context"

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

export function BatchForm() {
  const { batches, subjects, addBatch, updateBatch, deleteBatch } = useTimetable()
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    semester: "",
    strength: "",
    subjects: [] as string[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const batchData = {
      name: formData.name,
      department: formData.department,
      semester: Number.parseInt(formData.semester),
      strength: Number.parseInt(formData.strength),
      subjects: formData.subjects,
    }

    if (isEditing) {
      updateBatch(isEditing, batchData)
      setIsEditing(null)
    } else {
      addBatch(batchData)
    }

    setFormData({ name: "", department: "", semester: "", strength: "", subjects: [] })
  }

  const handleEdit = (batch: Batch) => {
    setFormData({
      name: batch.name,
      department: batch.department,
      semester: batch.semester.toString(),
      strength: batch.strength.toString(),
      subjects: batch.subjects,
    })
    setIsEditing(batch.id)
  }

  const handleCancel = () => {
    setIsEditing(null)
    setFormData({ name: "", department: "", semester: "", strength: "", subjects: [] })
  }

  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      subjects: checked ? [...prev.subjects, subjectId] : prev.subjects.filter((id) => id !== subjectId),
    }))
  }

  const departmentSubjects = subjects.filter((subject) => subject.department === formData.department)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Batch" : "Add New Batch"}</CardTitle>
          <CardDescription>Configure student batch details and subject assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Batch Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., CS-2024-A, Math-Sem3-B"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="strength">Student Strength</Label>
                <Input
                  id="strength"
                  type="number"
                  placeholder="e.g., 45"
                  value={formData.strength}
                  onChange={(e) => setFormData((prev) => ({ ...prev, strength: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, semester: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.department && departmentSubjects.length > 0 && (
              <div className="space-y-2">
                <Label>Subjects for this Batch</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {departmentSubjects.map((subject) => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject.id}
                        checked={formData.subjects.includes(subject.id)}
                        onCheckedChange={(checked) => handleSubjectChange(subject.id, checked as boolean)}
                      />
                      <Label htmlFor={subject.id} className="text-sm">
                        {subject.name} ({subject.code}) - {subject.hoursPerWeek}h/week
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit">{isEditing ? "Update Batch" : "Add Batch"}</Button>
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
          <CardTitle>Existing Batches ({batches.length})</CardTitle>
          <CardDescription>Manage your student batches</CardDescription>
        </CardHeader>
        <CardContent>
          {batches.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No batches added yet</p>
          ) : (
            <div className="space-y-4">
              {batches.map((batch) => (
                <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{batch.name}</h4>
                      <Badge variant="secondary">{batch.department}</Badge>
                      <Badge variant="outline">Sem {batch.semester}</Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground mb-2">
                      <span>Students: {batch.strength}</span>
                      <span>Subjects: {batch.subjects.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {batch.subjects.map((subjectId) => {
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
                    <Button size="sm" variant="outline" onClick={() => handleEdit(batch)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteBatch(batch.id)}>
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
