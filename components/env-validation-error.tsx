"use client"

import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import type { MissingEnvVar, EnvVarWarning } from "@/lib/env-validator"

interface EnvValidationErrorProps {
  missingVars: MissingEnvVar[]
  warnings: EnvVarWarning[]
  onDismiss?: () => void
  showDismiss?: boolean
}

export function EnvValidationError({ missingVars, warnings, onDismiss, showDismiss = true }: EnvValidationErrorProps) {
  if (missingVars.length === 0 && warnings.length === 0) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Environment Configuration Issues</AlertTitle>
      <AlertDescription>
        <div className="mt-2 text-sm">
          {missingVars.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Missing Required Environment Variables:</h4>
              <Accordion type="single" collapsible className="w-full">
                {missingVars.map((variable) => (
                  <AccordionItem key={variable.name} value={variable.name}>
                    <AccordionTrigger className="text-sm">
                      <span className="font-mono">{variable.name}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4 text-sm">
                        <p>
                          <span className="font-semibold">Description:</span> {variable.description}
                        </p>
                        <p>
                          <span className="font-semibold">Example:</span>{" "}
                          <code className="bg-muted px-1 py-0.5 rounded">{variable.example}</code>
                        </p>
                        <div>
                          <span className="font-semibold">Used in:</span>{" "}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {variable.usedIn.map((feature) => (
                              <Badge key={feature} variant="outline">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {variable.hasFallback && (
                          <p className="text-amber-500">
                            <span className="font-semibold">Note:</span> This variable has a fallback that is also
                            missing.
                          </p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Warnings:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-mono">{warning.name}</span>: {warning.message}
                    <Badge
                      variant={
                        warning.severity === "high"
                          ? "destructive"
                          : warning.severity === "medium"
                            ? "default"
                            : "outline"
                      }
                      className="ml-2"
                    >
                      {warning.severity}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 bg-muted p-3 rounded-md">
            <h4 className="font-semibold mb-2">To fix these issues:</h4>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Create or update your <code className="bg-background px-1 py-0.5 rounded">.env.local</code> file with
                the missing variables
              </li>
              <li>Restart your development server</li>
              <li>If using production, update your environment variables in your hosting platform</li>
            </ol>
          </div>

          {showDismiss && onDismiss && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={onDismiss}>
                Dismiss
              </Button>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
