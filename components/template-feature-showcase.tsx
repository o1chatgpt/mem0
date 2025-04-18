"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Share2, Download, Upload, Users, Sparkles, Lightbulb, FileText, Palette } from "lucide-react"

export function TemplateFeatureShowcase() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Template System Features</CardTitle>
          <CardDescription>
            A comprehensive set of tools for creating, managing, and sharing AI prompt templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Share2 className="mr-2 h-5 w-5 text-blue-500" />
                  Template Sharing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  Share your custom templates with colleagues, friends, or the community. Our template sharing system
                  makes collaboration easy.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Copy template JSON to clipboard</li>
                  <li>Download templates as JSON files</li>
                  <li>Share via any communication channel</li>
                  <li>Include metadata like author and version</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Download className="mr-2 h-5 w-5 text-green-500" />
                  Template Import
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  Import templates from various sources to expand your template library and benefit from others'
                  expertise.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Paste template JSON directly</li>
                  <li>Upload template files</li>
                  <li>Preview before importing</li>
                  <li>Smart duplicate handling</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-purple-500" />
                  Community Library
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  Browse a growing library of templates created by the community, covering various use cases and
                  specialties.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Curated template collections</li>
                  <li>Featured and popular templates</li>
                  <li>Filter by category or purpose</li>
                  <li>One-click template downloads</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
                  Template Customization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">Customize any template to match your specific needs, preferences, and use cases.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Edit template instructions</li>
                  <li>Modify focus areas and priorities</li>
                  <li>Adjust tone and style guidance</li>
                  <li>Save variations of templates</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
                  Template Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  Get inspired with a variety of example templates for different purposes and domains.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Domain-specific templates</li>
                  <li>Task-oriented templates</li>
                  <li>Role-based templates</li>
                  <li>Copy and adapt examples</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-red-500" />
                  Template Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  Organize and manage your templates with a comprehensive set of tools and features.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Categorize templates</li>
                  <li>Edit and update templates</li>
                  <li>Version tracking</li>
                  <li>Template preview</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5 text-indigo-500" />
                  Template Export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">Export your templates for backup, sharing, or transferring to other systems.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Export as JSON files</li>
                  <li>Include all template metadata</li>
                  <li>Batch export multiple templates</li>
                  <li>Standardized format</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Palette className="mr-2 h-5 w-5 text-teal-500" />
                  Template Styling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">Customize the visual appearance of your templates with colors, icons, and more.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Custom template colors</li>
                  <li>Icon selection</li>
                  <li>Visual categorization</li>
                  <li>Template preview</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
