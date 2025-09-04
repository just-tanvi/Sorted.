"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTimetable } from "@/contexts/timetable-context"

export function SchedulingParametersForm() {
  const { schedulingParameters, updateSchedulingParameters } = useTimetable()
  const [formData, setFormData] = useState(schedulingParameters)

  useEffect(() => {
    setFormData(schedulingParameters)
  }, [schedulingParameters])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSchedulingParameters(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduling Parameters</CardTitle>
        <CardDescription>Configure global scheduling constraints and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxClassesPerDay">Maximum Classes per Day</Label>
              <Input
                id="maxClassesPerDay"
                type="number"
                value={formData.maxClassesPerDay}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxClassesPerDay: Number.parseInt(e.target.value) || 0,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workingDaysPerWeek">Working Days per Week</Label>
              <Input
                id="workingDaysPerWeek"
                type="number"
                min="1"
                max="7"
                value={formData.workingDaysPerWeek}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    workingDaysPerWeek: Number.parseInt(e.target.value) || 5,
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="classStartTime">Class Start Time</Label>
              <Input
                id="classStartTime"
                type="time"
                value={formData.classStartTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    classStartTime: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classEndTime">Class End Time</Label>
              <Input
                id="classEndTime"
                type="time"
                value={formData.classEndTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    classEndTime: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="classDuration">Class Duration (minutes)</Label>
              <Input
                id="classDuration"
                type="number"
                value={formData.classDuration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    classDuration: Number.parseInt(e.target.value) || 60,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
              <Input
                id="breakDuration"
                type="number"
                value={formData.breakDuration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    breakDuration: Number.parseInt(e.target.value) || 15,
                  }))
                }
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Update Scheduling Parameters
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Current Configuration Summary</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Max Classes/Day: {schedulingParameters.maxClassesPerDay}</div>
            <div>Working Days: {schedulingParameters.workingDaysPerWeek}</div>
            <div>Start Time: {schedulingParameters.classStartTime}</div>
            <div>End Time: {schedulingParameters.classEndTime}</div>
            <div>Class Duration: {schedulingParameters.classDuration} min</div>
            <div>Break Duration: {schedulingParameters.breakDuration} min</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
