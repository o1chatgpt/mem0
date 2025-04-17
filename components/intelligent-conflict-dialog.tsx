"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { AlertTriangle, Check, Clock, Edit, Sparkles, Wand2 } from "lucide-react"
import type { EditingConflict, ResolutionStrategy } from "@/lib/intelligent-conflict-service"

interface IntelligentConflictDialogProps {
  conflict: EditingConflict | null
  suggestions: {
    suggestedStrategy: ResolutionStrategy
    suggestedContent: string
    confidence: number
    reasoning: string
    alternativeStrategies: ResolutionStrategy[]
  } | null
  isResolving: boolean
  onResolve: (strategy: ResolutionStrategy, content: string, reasoning?: string) => Promise<void>
  onClose: () => void
}

export function IntelligentConflictDialog({
  conflict,
  suggestions,
  isResolving,
  onResolve,
  onClose,
}: IntelligentConflictDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<ResolutionStrategy>("smart-merge")
  const [customContent, setCustomContent] = useState("")
  const [activeTab, setActiveTab] = useState("suggested")

  useEffect(() => {
    setIsOpen(!!conflict)

    if (conflict) {
      // Reset state when conflict changes
      setActiveTab("suggested")

      if (suggestions) {
        setSelectedStrategy(suggestions.suggestedStrategy)
        setCustomContent(suggestions.suggestedContent)
      } else {
        setSelectedStrategy("smart-merge")
        setCustomContent(conflict.users[0]?.content || "")
      }
    }
  }, [conflict, suggestions])

  const handleClose = () => {
    setIsOpen(false)
    onClose()
  }

  const handleResolve = async () => {
    if (!conflict) return

    const strategy = activeTab === "suggested" ? suggestions?.suggestedStrategy || "smart-merge" : selectedStrategy

    const content = activeTab === "custom" ? customContent : suggestions?.suggestedContent || ""

    const reasoning = activeTab === "suggested" ? suggestions?.reasoning : `Manually selected ${strategy} resolution`

    await onResolve(strategy, content, reasoning)
  }

  const getStrategyLabel = (strategy: ResolutionStrategy): string => {
    switch (strategy) {
      case "accept-newest":
        return "Accept Newest Changes"
      case "accept-oldest":
        return "Accept Oldest Changes"
      case "prefer-user":
        return "Prefer Your Changes"
      case "merge-changes":
        return "Basic Merge"
      case "smart-merge":
        return "Smart Merge"
      case "manual":
        return "Manual Resolution"
      default:
        return strategy
    }
  }

  if (!conflict) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            Intelligent Conflict Resolution
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-xs">
              Document: {conflict.documentId}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(conflict.detected).toLocaleString()}
            </Badge>
            <Badge
              variant={
                conflict.severity === "high" ? "destructive" : conflict.severity === "medium" ? "warning" : "secondary"
              }
              className="text-xs"
            >
              {conflict.severity.toUpperCase()} Severity
            </Badge>
          </div>

          <Alert className="mb-4 bg-amber-50">
            <AlertDescription>
              Multiple users have made conflicting changes to this document. Our intelligent system has analyzed your
              editing patterns and suggests a resolution.
            </AlertDescription>
          </Alert>

          {suggestions && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium flex items-center mb-2">
                <Sparkles className="h-4 w-4 mr-1 text-blue-500" />
                AI-Powered Suggestion ({Math.round(suggestions.confidence * 100)}% confidence)
              </h4>
              <p className="text-sm mb-2">{suggestions.reasoning}</p>
              <div className="flex items-center">
                <Badge variant="secondary" className="mr-2">
                  {getStrategyLabel(suggestions.suggestedStrategy)}
                </Badge>
                {suggestions.alternativeStrategies.map((strategy) => (
                  <Badge
                    key={strategy}
                    variant="outline"
                    className="mr-2 cursor-pointer hover:bg-secondary"
                    onClick={() => {
                      setSelectedStrategy(strategy)
                      setActiveTab("alternative")
                    }}
                  >
                    {getStrategyLabel(strategy)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Conflicting Changes:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conflict.users.map((user, index) => (
                <div key={index} className="border rounded-md p-3 bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-xs">
                          {user.name.charAt(0)}
                        </div>
                      </Avatar>
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(user.timestamp).toLocaleTimeString()}
                    </Badge>
                  </div>
                  <div className="font-mono text-xs whitespace-pre-wrap break-all max-h-32 overflow-auto border p-2 rounded bg-background">
                    {user.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="suggested" className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Suggested
              </TabsTrigger>
              <TabsTrigger value="alternative" className="flex items-center">
                <Wand2 className="h-4 w-4 mr-2" />
                Alternative
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                Custom
              </TabsTrigger>
            </TabsList>

            <TabsContent value="suggested" className="pt-4">
              {suggestions ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Suggested Resolution:</h4>
                    <div className="font-mono text-xs whitespace-pre-wrap break-all border p-3 rounded bg-muted/30 max-h-60 overflow-auto">
                      {suggestions.suggestedContent}
                    </div>
                  </div>

                  <Alert>
                    <AlertDescription className="text-sm">
                      This resolution was generated based on your past conflict resolution patterns and preferences.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">Loading suggestions...</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="alternative" className="pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {["accept-newest", "accept-oldest", "prefer-user", "merge-changes", "smart-merge", "manual"].map(
                    (strategy) => (
                      <Button
                        key={strategy}
                        variant={selectedStrategy === strategy ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => setSelectedStrategy(strategy as ResolutionStrategy)}
                      >
                        {getStrategyLabel(strategy as ResolutionStrategy)}
                      </Button>
                    ),
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Preview:</h4>
                  <div className="font-mono text-xs whitespace-pre-wrap break-all border p-3 rounded bg-muted/30 max-h-60 overflow-auto">
                    {/* In a real implementation, this would show a preview based on the selected strategy */}
                    {conflict.users[0]?.content || ""}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="pt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Custom Resolution:</h4>
                  <Textarea
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    className="font-mono text-xs min-h-[200px]"
                    placeholder="Enter your custom resolution..."
                  />
                </div>

                <Alert>
                  <AlertDescription className="text-sm">
                    Your custom resolution will be stored and used to improve future conflict resolution suggestions.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isResolving}>
            Cancel
          </Button>
          <Button
            onClick={handleResolve}
            disabled={isResolving || (activeTab === "custom" && !customContent)}
            className="ml-2"
          >
            {isResolving ? (
              <>Resolving...</>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Apply Resolution
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
