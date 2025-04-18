"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TemplateFilterDropdownProps {
  selectedTemplates: string[]
  onSelectionChange: (templates: string[]) => void
}

export function TemplateFilterDropdown({ selectedTemplates, onSelectionChange }: TemplateFilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    // In a real implementation, this would fetch the list of templates from an API
    const mockTemplates = [
      { value: "Research Assistant", label: "Research Assistant" },
      { value: "Creative Writing Coach", label: "Creative Writing Coach" },
      { value: "File Organizer", label: "File Organizer" },
      { value: "Technical Advisor", label: "Technical Advisor" },
      { value: "Project Planner", label: "Project Planner" },
      { value: "Learning Coach", label: "Learning Coach" },
      { value: "Personal Assistant", label: "Personal Assistant" },
      { value: "Data Analyst", label: "Data Analyst" },
    ]
    setTemplates(mockTemplates)
  }, [])

  const toggleTemplate = (template: string) => {
    if (selectedTemplates.includes(template)) {
      onSelectionChange(selectedTemplates.filter((t) => t !== template))
    } else {
      onSelectionChange([...selectedTemplates, template])
    }
  }

  const clearSelection = () => {
    onSelectionChange([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[250px] justify-between">
          {selectedTemplates.length > 0
            ? `${selectedTemplates.length} template${selectedTemplates.length > 1 ? "s" : ""} selected`
            : "Filter by template"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search templates..." />
          <CommandList>
            <CommandEmpty>No template found.</CommandEmpty>
            <CommandGroup>
              {templates.map((template) => (
                <CommandItem
                  key={template.value}
                  value={template.value}
                  onSelect={() => toggleTemplate(template.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedTemplates.includes(template.value) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {template.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {selectedTemplates.length > 0 && (
            <div className="border-t p-2">
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedTemplates.map((template) => (
                  <Badge
                    key={template}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleTemplate(template)}
                  >
                    {template}
                    <span className="ml-1 text-xs">×</span>
                  </Badge>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={clearSelection}>
                Clear selection
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
