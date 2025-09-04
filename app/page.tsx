"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/login-form"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardOverview } from "@/components/dashboard-overview"
import { ParameterManagement } from "@/components/parameter-management"
import { TimetableGeneration } from "@/components/timetable-generation"
import { ReviewDashboard } from "@/components/workflow/review-dashboard"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const [currentView, setCurrentView] = useState("dashboard")

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const renderContent = () => {
    switch (currentView) {
      case "parameters":
        return <ParameterManagement />
      case "timetables":
        return <TimetableGeneration />
      case "review":
        return <ReviewDashboard />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`px-4 py-2 rounded-lg ${
              currentView === "dashboard"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView("parameters")}
            className={`px-4 py-2 rounded-lg ${
              currentView === "parameters"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Parameters
          </button>
          <button
            onClick={() => setCurrentView("timetables")}
            className={`px-4 py-2 rounded-lg ${
              currentView === "timetables"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Generate Timetables
          </button>
          <button
            onClick={() => setCurrentView("review")}
            className={`px-4 py-2 rounded-lg ${
              currentView === "review"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Review & Approval
          </button>
        </div>
        {renderContent()}
      </div>
    </DashboardLayout>
  )
}
