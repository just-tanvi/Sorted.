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
import { useTimetable, type Classroom } from "@/contexts/timetable-context"

export function ClassroomForm() {
  const { classrooms, addClassroom, updateClassroom, deleteClassroom } = useTimetable()
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    type: "lecture" as const,
    equipment: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const classroomData = {
      name: formData.name,
      capacity: Number.parseInt(formData.capacity),
      type: formData.type,
      equipment: formData.equipment
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    }

    if (isEditing) {
      updateClassroom(isEditing, classroomData)
      setIsEditing(null)
    } else {
      addClassroom(classroomData)
    }

    setFormData({ name: "", capacity: "", type: "lecture", equipment: "" })
  }

  const handleEdit = (classroom: Classroom) => {
    setFormData({
      name: classroom.name,
      capacity: classroom.capacity.toString(),
      type: classroom.type,
      equipment: classroom.equipment.join(", "),
    })
    setIsEditing(classroom.id)
  }

  const handleCancel = () => {
    setIsEditing(null)
    setFormData({ name: "", capacity: "", type: "lecture", equipment: "" })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Classroom" : "Add New Classroom"}</CardTitle>
          <CardDescription>Configure classroom details and available equipment</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Classroom Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Room 101, Lab A"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="e.g., 50"
                  value={formData.capacity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, capacity: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Room Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "lecture" | "lab" | "seminar") =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lecture">Lecture Hall</SelectItem>
                    <SelectItem value="lab">Laboratory</SelectItem>
                    <SelectItem value="seminar">Seminar Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment (comma-separated)</Label>
                <Input
                  id="equipment"
                  placeholder="e.g., Projector, Whiteboard, AC"
                  value={formData.equipment}
                  onChange={(e) => setFormData((prev) => ({ ...prev, equipment: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">{isEditing ? "Update Classroom" : "Add Classroom"}</Button>
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
          <CardTitle>Existing Classrooms ({classrooms.length})</CardTitle>
          <CardDescription>Manage your classroom inventory</CardDescription>
        </CardHeader>
        <CardContent>
          {classrooms.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No classrooms added yet</p>
          ) : (
            <div className="space-y-4">
              {classrooms.map((classroom) => (
                <div key={classroom.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{classroom.name}</h4>
                      <Badge variant="secondary" className="capitalize">
                        {classroom.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Capacity: {classroom.capacity}</span>
                    </div>
                    {classroom.equipment.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {classroom.equipment.map((item, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(classroom)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteClassroom(classroom.id)}>
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
