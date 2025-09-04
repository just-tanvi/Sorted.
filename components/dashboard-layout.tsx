"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Calendar, Users, BookOpen, Settings, LogOut, Menu, Home, FileText, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Parameters", href: "/parameters", icon: Settings }, // Added Parameters navigation
  { name: "Timetables", href: "/timetables", icon: Calendar },
  { name: "Subjects", href: "/subjects", icon: BookOpen },
  { name: "Faculty", href: "/faculty", icon: Users },
  { name: "Classrooms", href: "/classrooms", icon: Clock },
  { name: "Reports", href: "/reports", icon: FileText },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-primary-foreground hover:bg-primary/90"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Timetable Management</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium">{user?.name}</p>
              <p className="text-primary-foreground/70 capitalize">{user?.role}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-primary-foreground hover:bg-primary/90">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-sidebar border-r border-sidebar-border transition-all duration-300",
            sidebarOpen ? "w-64" : "w-16",
          )}
        >
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    !sidebarOpen && "px-2",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {sidebarOpen && <span className="ml-3">{item.name}</span>}
                </Button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
