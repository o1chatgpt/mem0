"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Trash2, Edit, X, Database, Brain } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { VectorItem } from "@/lib/vector-store"

export function VectorDocuments() {
  const { vectorStore } = useAppContext()
  const [documents, setDocuments] = useState<VectorItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<VectorItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newDocument, setNewDocument] = useState({ content: "", tags: "" })
  const [editingDocument, setEditingDocument] = useState<VectorItem | null>(null)
  const [isLocalStorage, setIsLocalStorage] = useState(true)

  // Load all documents
  const loadDocuments = async () => {
    setLoading(true)
    setError(null)
    try {
      await vectorStore.initialize()
      setIsLocalStorage(vectorStore.isUsingLocalFallback())
      const docs = await vectorStore.getAllDocuments()
      setDocuments(docs)
    } catch (err) {
      console.error("Error loading vector documents:", err)
      setError("Failed to load vector documents")
    } finally {
      setLoading(false)
    }
  }

  // Load documents on mount
  useEffect(() => {
    loadDocuments()
  }, [])

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setLoading(true)
    try {
      const results = await vectorStore.searchSimilar(searchQuery)
      setSearchResults(results)
    } catch (err) {
      console.error("Error searching vector documents:", err)
      setError("Failed to search vector documents")
    } finally {
      setLoading(false)
    }
  }

  // Handle add document
  const handleAddDocument = async () => {
    if (!newDocument.content.trim()) return

    setLoading(true)
    try {
      const metadata = {
        tags: newDocument.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }
      await vectorStore.addDocument(newDocument.content, metadata)
      setIsAddDialogOpen(false)
      setNewDocument({ content: "", tags: "" })
      await loadDocuments()
    } catch (err) {
      console.error("Error adding vector document:", err)
      setError("Failed to add vector document")
    } finally {
      setLoading(false)
    }
  }

  // Handle edit document
  const handleEditDocument = async () => {
    if (!editingDocument || !editingDocument.content.trim()) return

    setLoading(true)
    try {
      const metadata = {
        ...editingDocument.metadata,
        tags:
          typeof editingDocument.metadata.tags === "string"
            ? editingDocument.metadata.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            : editingDocument.metadata.tags || [],
      }

      await vectorStore.updateDocument(editingDocument.id, editingDocument.content, metadata)
      setIsEditDialogOpen(false)
      setEditingDocument(null)
      await loadDocuments()
    } catch (err) {
      console.error("Error updating vector document:", err)
      setError("Failed to update vector document")
    } finally {
      setLoading(false)
    }
  }

  // Handle delete document
  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    setLoading(true)
    try {
      await vectorStore.deleteDocument(id)
      await loadDocuments()
    } catch (err) {
      console.error("Error deleting vector document:", err)
      setError("Failed to delete vector document")
    } finally {
      setLoading(false)
    }
  }

  // Get documents to display
  const displayedDocuments = isSearching ? searchResults : documents

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vector Documents</h2>
        <div className="flex space-x-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>
      </div>

      {isLocalStorage && (
        <Alert className="bg-amber-50 border-amber-200">
          <Brain className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            Using local storage for vector documents. Your data will only be stored in this browser session.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <Database className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex space-x-2 mb-4">
        <Input
          placeholder="Search vector documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        {isSearching && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setSearchResults([])
              setIsSearching(false)
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {loading && !displayedDocuments.length ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : displayedDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Database className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Vector Documents Found</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              {isSearching
                ? "No documents match your search query."
                : "You haven't created any vector documents yet. Click the 'Add Document' button to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedDocuments.map((doc) => (
            <Card key={doc.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between">
                  <span className="truncate">
                    {doc.content.substring(0, 50)}
                    {doc.content.length > 50 ? "..." : ""}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingDocument({
                          ...doc,
                          metadata: {
                            ...doc.metadata,
                            tags: Array.isArray(doc.metadata.tags)
                              ? doc.metadata.tags.join(", ")
                              : doc.metadata.tags || "",
                          },
                        })
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteDocument(doc.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{new Date(doc.timestamp).toLocaleString()}</p>
                <p className="mb-2">{doc.content}</p>
                {doc.metadata.tags && (
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(doc.metadata.tags) ? doc.metadata.tags : [doc.metadata.tags]).map((tag, i) => (
                      <Badge key={i} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Document Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vector Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newDocument.content}
                onChange={(e) => setNewDocument({ ...newDocument, content: e.target.value })}
                placeholder="Enter document content..."
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={newDocument.tags}
                onChange={(e) => setNewDocument({ ...newDocument, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDocument} disabled={!newDocument.content.trim() || loading}>
              {loading ? "Adding..." : "Add Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vector Document</DialogTitle>
          </DialogHeader>
          {editingDocument && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={editingDocument.content}
                  onChange={(e) => setEditingDocument({ ...editingDocument, content: e.target.value })}
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                <Input
                  id="edit-tags"
                  value={editingDocument.metadata.tags}
                  onChange={(e) =>
                    setEditingDocument({
                      ...editingDocument,
                      metadata: { ...editingDocument.metadata, tags: e.target.value },
                    })
                  }
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDocument} disabled={!editingDocument?.content.trim() || loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
