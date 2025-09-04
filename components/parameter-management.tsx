"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClassroomForm } from "@/components/forms/classroom-form"
import { SubjectForm } from "@/components/forms/subject-form"
import { FacultyForm } from "@/components/forms/faculty-form"
import { BatchForm } from "@/components/forms/batch-form"
import { SchedulingParametersForm } from "@/components/forms/scheduling-parameters-form"

export function ParameterManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-balance">Parameter Management</h2>
        <p className="text-muted-foreground text-pretty">
          Configure all the parameters needed for timetable generation
        </p>
      </div>

      <Tabs defaultValue="classrooms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="classrooms">Classrooms</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="parameters">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="classrooms">
          <ClassroomForm />
        </TabsContent>

        <TabsContent value="subjects">
          <SubjectForm />
        </TabsContent>

        <TabsContent value="faculty">
          <FacultyForm />
        </TabsContent>

        <TabsContent value="batches">
          <BatchForm />
        </TabsContent>

        <TabsContent value="parameters">
          <SchedulingParametersForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
