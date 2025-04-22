"use client"

import { ResponsivePreferencesAdder } from "@/components/responsive-preferences-adder"

export default function ResponsivePreferencesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Responsive Design Preferences</h1>
      <p className="text-muted-foreground mb-6">Add preferences for how interfaces should adapt to different devices</p>

      <ResponsivePreferencesAdder />

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-2">How to use these preferences</h2>
        <p className="mb-4">
          After adding your responsive design preferences, you can ask Mem0 about them or request UI designs that follow
          your preferences.
        </p>
        <h3 className="text-lg font-medium mb-2">Example questions to ask Mem0:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>"What are my preferences for mobile interfaces?"</li>
          <li>"How do I prefer interfaces to adapt between desktop and mobile?"</li>
          <li>"Create a responsive navigation component based on my preferences"</li>
          <li>"What's my preference for table layouts on mobile devices?"</li>
        </ul>
      </div>
    </div>
  )
}
