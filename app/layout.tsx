import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AuthProvider } from "@/contexts/auth-context"
import { TimetableProvider } from "@/contexts/timetable-context"
import { WorkflowProvider } from "@/contexts/workflow-context"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sorted.",
  description: "Higher Education Class Scheduling Platform.",
  generator: "Sorted.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <AuthProvider>
            <TimetableProvider>
              <WorkflowProvider>{children}</WorkflowProvider>
            </TimetableProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}
